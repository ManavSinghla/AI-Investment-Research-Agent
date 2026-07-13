import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { fetchFinancials, searchDuckDuckGo, fetchYahooNews } from "./tools.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Define the State
export const GraphState = Annotation.Root({
  query: Annotation,
  companyInfo: Annotation,
  financials: Annotation,
  news: Annotation,
  competitors: Annotation,
  risks: Annotation,
  verdict: Annotation,
  logs: Annotation({
    reducer: (curr, next) => curr.concat(next),
    default: () => [],
  }),
});

// ponytail: use built-in maxRetries instead of custom loop
const getModel = () => new ChatGroq({
  model: "llama-3.1-8b-instant",
  maxRetries: 2,
  apiKey: process.env.GROQ_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY,
});

// Fallback for financials node if Yahoo Finance is rate-limited (status 429) or fails
async function fetchFinancialsFallback(companyName, ticker) {
  const model = getModel();
  const searchQuery = `${companyName} ${ticker ? `(${ticker})` : ""} stock price market cap P/E ratio revenue margins debt free cashflow key financial metrics`;
  
  let searchData = [];
  try {
    const searchRes = await searchDuckDuckGo(searchQuery, 6);
    if (searchRes.success && searchRes.data?.length > 0) {
      searchData = searchRes.data;
    }
  } catch (err) {
    console.error("DuckDuckGo search failed in financials fallback:", err);
  }

  if (searchData.length === 0) {
    return { success: false, error: "Search data for financials fallback was empty" };
  }

  const prompt = `Based on these recent search results for ${companyName}:
${JSON.stringify(searchData)}

Extract or estimate the key financial metrics for this company. Return a strict JSON object with this schema:
{
  "price": number (current stock price) or null,
  "marketCap": number (total market capitalization in dollars) or null,
  "trailingPE": number (trailing price-to-earnings ratio) or null,
  "forwardPE": number (forward P/E ratio) or null,
  "revenueGrowth": number (e.g. 0.15 for 15% YoY growth) or null,
  "profitMargins": number (e.g. 0.22 for 22%) or null,
  "operatingMargins": number (e.g. 0.30 for 30%) or null,
  "grossMargins": number (e.g. 0.50 for 50%) or null,
  "returnOnEquity": number (e.g. 0.18 for 18%) or null,
  "earningsGrowth": number (e.g. 0.12 for 12%) or null,
  "totalRevenue": number (in dollars) or null,
  "totalDebt": number (in dollars) or null,
  "debtToEquity": number (ratio as percentage or decimal) or null,
  "freeCashflow": number (in dollars) or null,
  "dividendYield": number (e.g. 0.015 for 1.5%) or null,
  "fiftyTwoWeekHigh": number or null,
  "fiftyTwoWeekLow": number or null,
  "recommendationKey": string (e.g. "buy", "hold", "sell") or null,
  "sector": string or null,
  "industry": string or null,
  "website": string or null,
  "description": string (short company description) or null
}

Important: Base all values strictly on the search results. If a value is missing, set it to null. Convert large figures like "3.1T" or "45B" to full numbers (e.g. 3100000000000 or 45000000000). Convert percentages (e.g. 15%) to decimals (0.15). Do not include any text other than the strict JSON.`;

  try {
    const res = await model.invoke([
      new SystemMessage("You output strict JSON without markdown formatting."),
      new HumanMessage(prompt)
    ]);
    
    const jsonStr = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);
    
    return {
      success: true,
      data: {
        price: data.price ?? null,
        marketCap: data.marketCap ?? null,
        trailingPE: data.trailingPE ?? null,
        forwardPE: data.forwardPE ?? null,
        revenueGrowth: data.revenueGrowth ?? null,
        profitMargins: data.profitMargins ?? null,
        operatingMargins: data.operatingMargins ?? null,
        grossMargins: data.grossMargins ?? null,
        returnOnEquity: data.returnOnEquity ?? null,
        earningsGrowth: data.earningsGrowth ?? null,
        totalRevenue: data.totalRevenue ?? null,
        totalDebt: data.totalDebt ?? null,
        debtToEquity: data.debtToEquity ?? null,
        freeCashflow: data.freeCashflow ?? null,
        dividendYield: data.dividendYield ?? null,
        fiftyTwoWeekHigh: data.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: data.fiftyTwoWeekLow ?? null,
        recommendationKey: data.recommendationKey ?? null,
        sector: data.sector ?? "Unknown",
        industry: data.industry ?? "Unknown",
        website: data.website ?? null,
        description: data.description ?? "No description available.",
      }
    };
  } catch (err) {
    return { success: false, error: `Fallback extraction failed: ${err.message}` };
  }
}

async function disambiguateNode(state, config) {
  config?.configurable?.onProgress?.(`Resolving company ticker for "${state.query}"...`, "disambiguateNode");
  const model = getModel();
  const prompt = `You are a financial researcher. The user asked to research: "${state.query}".
If the query is highly ambiguous (e.g. "Delta" could be Delta Airlines or Delta Faucet) or maps to multiple distinct public companies, return a JSON object with:
"isAmbiguous": true,
"candidates": [{"ticker": "DAL", "name": "Delta Air Lines, Inc."}, {"ticker": "DLTA", "name": "Delta Apparel"}]

If the query clearly refers to one specific company, return:
"isAmbiguous": false,
"ticker": the stock ticker (if public, else null),
"name": the official company name,
"sector": the company's primary sector.

ONLY return JSON.`;

  const res = await model.invoke([
    new SystemMessage("You output strict JSON without markdown formatting."),
    new HumanMessage(prompt)
  ]);
  
  let companyInfo = {};
  try {
    const jsonStr = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
    companyInfo = JSON.parse(jsonStr);
  } catch(e) {
    companyInfo = { name: state.query, ticker: null, sector: "Unknown", isAmbiguous: false };
  }

  if (companyInfo.isAmbiguous) {
    const err = new Error("AMBIGUOUS_QUERY");
    err.candidates = companyInfo.candidates;
    throw err;
  }

  return {
    companyInfo,
    logs: [`Resolved company to ${companyInfo.name} (${companyInfo.ticker || 'No ticker'})`]
  };
}

async function financialsNode(state, config) {
  if (!state.companyInfo.ticker) {
    config?.configurable?.onProgress?.("Skipping financials (no ticker).", "fetchFinancialsNode");
    return {
      financials: { success: false, error: "No ticker available" },
      logs: ["Skipping financials (no ticker)."]
    };
  }
  
  config?.configurable?.onProgress?.(`Fetching financial data for ${state.companyInfo.ticker}...`, "fetchFinancialsNode");
  let result = await fetchFinancials(state.companyInfo.ticker);
  
  if (!result.success) {
    config?.configurable?.onProgress?.(`Yahoo Finance rate limited (429) or failed. Running search-based fallback...`, "fetchFinancialsNode");
    try {
      const fallbackResult = await fetchFinancialsFallback(state.companyInfo.name, state.companyInfo.ticker);
      if (fallbackResult.success) {
        result = fallbackResult;
      } else {
        config?.configurable?.onProgress?.(`Fallback also failed: ${fallbackResult.error}`, "fetchFinancialsNode");
      }
    } catch (err) {
      console.error("Fallback financials failed:", err);
    }
  }

  return {
    financials: result,
    logs: [`Fetched financials for ${state.companyInfo.ticker}.`]
  };
}

async function newsNode(state, config) {
  config?.configurable?.onProgress?.(`Fetching recent news and sentiment for ${state.companyInfo.name}...`, "fetchNewsNode");
  const model = getModel();
  
  let newsData = [];
  if (state.companyInfo.ticker) {
    const yahooNews = await fetchYahooNews(state.companyInfo.ticker, 5);
    if (yahooNews.success && yahooNews.data?.length > 0) {
      newsData = yahooNews.data;
    }
  }
  
  if (newsData.length === 0) {
    const query = `${state.companyInfo.name} recent news financial`;
    const ddgNews = await searchDuckDuckGo(query, 5);
    if (ddgNews.success) {
      newsData = ddgNews.data || [];
    }
  }
  
  const prompt = `Based on the following recent news for ${state.companyInfo.name}:
${JSON.stringify(newsData)}

Analyze the overall market sentiment. Return a strict JSON object with:
"score": A number from 0 to 100 where 0 is extremely negative, 50 is neutral, and 100 is extremely positive.
"summary": A 1-2 sentence summary of the news sentiment.`;

  const res = await model.invoke([
    new SystemMessage("You output strict JSON without markdown formatting."),
    new HumanMessage(prompt)
  ]);
  
  let sentiment = { score: 50, summary: "Neutral sentiment due to lack of data." };
  try {
    const jsonStr = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
    sentiment = JSON.parse(jsonStr);
  } catch(e) {
    console.error("Failed to parse sentiment:", e);
  }

  return {
    news: { sentiment, sources: newsData },
    logs: [`Analyzed recent news and sentiment for ${state.companyInfo.name}.`]
  };
}

async function competitorsNode(state, config) {
  config?.configurable?.onProgress?.(`Analyzing competitors for ${state.companyInfo.name}...`, "fetchCompetitorsNode");
  const model = getModel();
  
  const query = `${state.companyInfo.name} main competitors market share`;
  const searchResult = await searchDuckDuckGo(query, 5);
  const dataExists = searchResult.success && searchResult.data && searchResult.data.length > 0;
  
  const prompt = dataExists 
    ? `Based on the following search results about ${state.companyInfo.name}'s competitors:
${JSON.stringify(searchResult.data)}

Summarize their competitive position in 2-3 sentences and list 2-3 main competitors.`
    : `Using your general knowledge about ${state.companyInfo.name} (sector: ${state.companyInfo.sector || 'Unknown'}), summarize their competitive position in the industry in 2-3 sentences and list 2-3 of their primary competitors.`;

  const res = await model.invoke([new HumanMessage(prompt)]);
  return {
    competitors: { summary: res.content, sources: dataExists ? searchResult.data : [] },
    logs: [`Analyzed competitive position for ${state.companyInfo.name}.`]
  };
}

async function risksNode(state, config) {
  config?.configurable?.onProgress?.(`Scanning risk factors for ${state.companyInfo.name}...`, "fetchRisksNode");
  const model = getModel();
  
  const query = `${state.companyInfo.name} risk factors litigation regulatory financial`;
  const searchResult = await searchDuckDuckGo(query, 5);
  const dataExists = searchResult.success && searchResult.data && searchResult.data.length > 0;
  
  const prompt = dataExists
    ? `Based on the following search results about risks for ${state.companyInfo.name}:
${JSON.stringify(searchResult.data)}

Summarize the key risk factors (regulatory, financial, operational) in 2-3 sentences.`
    : `Using your general knowledge about ${state.companyInfo.name}, summarize their key risk factors (regulatory, financial, operational) in 2-3 sentences.`;

  const res = await model.invoke([new HumanMessage(prompt)]);
  return {
    risks: { summary: res.content, sources: dataExists ? searchResult.data : [] },
    logs: [`Analyzed risk factors for ${state.companyInfo.name}.`]
  };
}

async function decisionNode(state, config) {
  config?.configurable?.onProgress?.(`Synthesizing final investment verdict for ${state.companyInfo.name}...`, "decisionNode");
  const model = getModel();
  const prompt = `You are an expert investment analyst. Based on the following research for ${state.companyInfo.name}:

Financials:
${JSON.stringify(state.financials)}

Recent News:
${JSON.stringify(state.news)}

Competitive Position:
${JSON.stringify(state.competitors?.summary)}

Risks:
${JSON.stringify(state.risks?.summary)}

Output a structured investment verdict strictly as a JSON object (do not include markdown wrapping or other text) with this schema:
{
  "verdict": "Invest" | "Pass" | "Watch",
  "confidence": "Low" | "Medium" | "High",
  "summary": "2-4 sentences explaining the rationale",
  "supporting_factors": [ "bullet point 1", "bullet point 2" ],
  "risk_factors": [ "risk 1", "risk 2" ],
  "sources": [ "url1", "url2" ]
}

Important: Base your claims strictly on the provided data. Extract URLs from the news/competitors/risks search results for the "sources" array.`;

  const res = await model.invoke([
    new SystemMessage("You output strict JSON without markdown formatting."),
    new HumanMessage(prompt)
  ]);
  
  let verdict = {};
  try {
    const jsonStr = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
    verdict = JSON.parse(jsonStr);
  } catch(e) {
    console.error("Failed to parse verdict JSON:", res.content);
    verdict = {
      verdict: "Watch",
      confidence: "Low",
      summary: "Failed to generate structured verdict due to parsing error.",
      supporting_factors: [],
      risk_factors: [],
      sources: []
    };
  }

  return {
    verdict,
    logs: ["Generated final investment verdict."]
  };
}

export function createResearchAgent() {
  const builder = new StateGraph(GraphState)
    .addNode("disambiguateNode", disambiguateNode)
    .addNode("fetchFinancialsNode", financialsNode)
    .addNode("fetchNewsNode", newsNode)
    .addNode("fetchCompetitorsNode", competitorsNode)
    .addNode("fetchRisksNode", risksNode)
    .addNode("decisionNode", decisionNode)
    .addEdge(START, "disambiguateNode")
    .addEdge("disambiguateNode", "fetchFinancialsNode")
    .addEdge("disambiguateNode", "fetchNewsNode")
    .addEdge("disambiguateNode", "fetchCompetitorsNode")
    .addEdge("disambiguateNode", "fetchRisksNode")
    .addEdge("fetchFinancialsNode", "decisionNode")
    .addEdge("fetchNewsNode", "decisionNode")
    .addEdge("fetchCompetitorsNode", "decisionNode")
    .addEdge("fetchRisksNode", "decisionNode")
    .addEdge("decisionNode", END);

  return builder.compile();
}
