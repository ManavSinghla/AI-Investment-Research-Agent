import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { fetchFinancials, searchDuckDuckGo } from "./tools.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

const getModel = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-flash-latest",
    maxOutputTokens: 2048,
    apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY,
  });
};

async function disambiguateNode(state) {
  const model = getModel();
  const prompt = `You are a financial researcher. The user asked to research: "${state.query}".
Return a JSON object with:
"ticker": the stock ticker (if public, else null)
"name": the official company name
"sector": the company's primary sector.
Example output: {"ticker": "AAPL", "name": "Apple Inc.", "sector": "Technology"}
If the company is completely unknown, do your best guess or return null for ticker. ONLY return JSON.`;

  const res = await model.invoke([new HumanMessage(prompt)]);
  let companyInfo = {};
  try {
    const jsonStr = res.content.replace(/```json/g, '').replace(/```/g, '').trim();
    companyInfo = JSON.parse(jsonStr);
  } catch(e) {
    companyInfo = { name: state.query, ticker: null, sector: "Unknown" };
  }

  return {
    companyInfo,
    logs: [`Resolved company to ${companyInfo.name} (${companyInfo.ticker || 'No ticker'})`]
  };
}

async function financialsNode(state) {
  if (!state.companyInfo.ticker) {
    return {
      financials: { success: false, error: "No ticker available" },
      logs: ["Skipping financials (no ticker)."]
    };
  }
  
  const result = await fetchFinancials(state.companyInfo.ticker);
  return {
    financials: result,
    logs: [`Fetched financials for ${state.companyInfo.ticker}.`]
  };
}

async function newsNode(state) {
  const query = `${state.companyInfo.name} recent news financial`;
  const result = await searchDuckDuckGo(query, 5);
  return {
    news: result,
    logs: [`Fetched recent news for ${state.companyInfo.name}.`]
  };
}

async function competitorsNode(state) {
  const model = getModel();
  // First, search for competitors
  const query = `${state.companyInfo.name} main competitors market share`;
  const searchResult = await searchDuckDuckGo(query, 5);
  
  const prompt = `Based on the following search results about ${state.companyInfo.name}'s competitors:
${JSON.stringify(searchResult.data || [])}

Summarize their competitive position in 2-3 sentences and list 2-3 main competitors.`;

  const res = await model.invoke([new HumanMessage(prompt)]);
  return {
    competitors: { summary: res.content, sources: searchResult.data },
    logs: [`Analyzed competitive position for ${state.companyInfo.name}.`]
  };
}

async function risksNode(state) {
  const model = getModel();
  const query = `${state.companyInfo.name} risk factors litigation regulatory financial`;
  const searchResult = await searchDuckDuckGo(query, 5);
  
  const prompt = `Based on the following search results about risks for ${state.companyInfo.name}:
${JSON.stringify(searchResult.data || [])}

Summarize the key risk factors (regulatory, financial, operational) in 2-3 sentences.`;

  const res = await model.invoke([new HumanMessage(prompt)]);
  return {
    risks: { summary: res.content, sources: searchResult.data },
    logs: [`Analyzed risk factors for ${state.companyInfo.name}.`]
  };
}

async function decisionNode(state) {
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
