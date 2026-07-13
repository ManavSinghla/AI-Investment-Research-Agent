import YahooFinance from 'yahoo-finance2';
import { search } from 'duck-duck-scrape';

const yahooFinance = new YahooFinance();

export async function fetchFinancials(ticker) {
  try {
    const quote = (await yahooFinance.quote(ticker)) || {};
    const quoteSummaryResult = await yahooFinance.quoteSummary(ticker, { 
      modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics', 'summaryProfile'] 
    });
    
    const financialData = quoteSummaryResult.financialData || {};
    const keyStats = quoteSummaryResult.defaultKeyStatistics || {};
    const profile = quoteSummaryResult.summaryProfile || {};
    const detail = quoteSummaryResult.summaryDetail || {};
 
    return {
      success: true,
      data: {
        price: quote.regularMarketPrice,
        marketCap: quote.marketCap,
        trailingPE: quote.trailingPE,
        forwardPE: quote.forwardPE,
        revenueGrowth: financialData.revenueGrowth,
        profitMargins: financialData.profitMargins,
        operatingMargins: financialData.operatingMargins,
        grossMargins: financialData.grossMargins,
        returnOnEquity: financialData.returnOnEquity,
        earningsGrowth: financialData.earningsGrowth,
        totalRevenue: financialData.totalRevenue,
        totalDebt: financialData.totalDebt,
        debtToEquity: financialData.debtToEquity,
        freeCashflow: financialData.freeCashflow,
        dividendYield: detail.dividendYield,
        fiftyTwoWeekHigh: detail.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: detail.fiftyTwoWeekLow,
        recommendationKey: financialData.recommendationKey,
        sector: profile.sector,
        industry: profile.industry,
        website: profile.website,
        description: profile.longBusinessSummary,
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function searchDuckDuckGo(query, numResults = 5) {
  // Add a small randomized staggered delay (100ms - 900ms) to prevent bot detection from parallel graph requests
  await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 100));
  try {
    const searchResults = await search(query);
    
    return {
      success: true,
      data: searchResults.results.slice(0, numResults).map(r => ({
        title: r.title,
        link: r.url,
        snippet: r.description
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function fetchYahooNews(ticker, numResults = 5) {
  try {
    const result = await yahooFinance.search(ticker);
    return {
      success: true,
      data: (result.news || []).slice(0, numResults).map(n => ({
        title: n.title,
        link: n.link,
        snippet: `Published by ${n.publisher} on ${new Date(n.providerPublishTime).toLocaleDateString()}`
      }))
    };
  } catch(error) {
    return { success: false, error: error.message };
  }
}
