import yahooFinance from 'yahoo-finance2';
import { search } from 'duck-duck-scrape';

export async function fetchFinancials(ticker) {
  try {
    const quote = await yahooFinance.quote(ticker);
    const summaryDetail = await yahooFinance.quoteSummary(ticker, { modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics'] });
    
    const financialData = summaryDetail.financialData || {};
    const keyStats = summaryDetail.defaultKeyStatistics || {};

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
        totalDebt: financialData.totalDebt,
        debtToEquity: financialData.debtToEquity,
        freeCashflow: financialData.freeCashflow,
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function searchDuckDuckGo(query, numResults = 5) {
  try {
    const searchResults = await search(query, {
      safeSearch: 'moderate'
    });
    
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
