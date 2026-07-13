import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';

export default function DashboardView({ query, verdict, error, dimensions = {}, onClose }) {
  const [activeTab, setActiveTab] = useState('verdict');

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-on-background z-50">
        <span className="material-symbols-outlined text-[64px] text-error mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
        <h1 className="font-headline-md text-2xl text-error mb-2">Research Failed</h1>
        <p className="text-on-surface-variant max-w-md text-center">{error}</p>
        <button className="mt-8 px-6 py-2 border border-white/20 rounded hover:bg-white/10" onClick={onClose}>Try Again</button>
      </div>
    );
  }
  if (!verdict) return null;

  const isInvest = verdict.verdict.toUpperCase() === 'INVEST' || verdict.verdict.toUpperCase() === 'BUY';
  const isWatch = verdict.verdict.toUpperCase() === 'WATCH' || verdict.verdict.toUpperCase() === 'HOLD';
  const signalText = isInvest ? 'BUY SIGNAL' : isWatch ? 'HOLD SIGNAL' : 'PASS SIGNAL';
  const verdictText = verdict.verdict.toUpperCase();

  const colorClass = isInvest 
    ? 'text-emerald-400' 
    : isWatch 
      ? 'text-amber-400' 
      : 'text-red-400';

  const glowStyle = isInvest 
    ? { textShadow: '0 0 25px rgba(52, 211, 153, 0.4)' } 
    : isWatch 
      ? { textShadow: '0 0 25px rgba(251, 191, 36, 0.4)' } 
      : { textShadow: '0 0 25px rgba(248, 113, 113, 0.4)' };

  const bgBorderClass = isInvest
    ? 'border-emerald-500/20 bg-emerald-500/5'
    : isWatch
      ? 'border-amber-500/20 bg-amber-500/5'
      : 'border-red-500/20 bg-red-500/5';

  const dotClass = isInvest
    ? 'bg-emerald-400'
    : isWatch
      ? 'bg-amber-400'
      : 'bg-red-400';

  const confidenceColorClass = verdict.confidence?.toLowerCase() === 'high'
    ? 'text-emerald-400'
    : verdict.confidence?.toLowerCase() === 'medium'
      ? 'text-amber-400'
      : 'text-red-400';

  const tabs = [
    { id: 'verdict', label: 'Verdict', icon: 'gavel' },
    { id: 'financials', label: 'Financials', icon: 'account_balance' },
    { id: 'news', label: 'Sentiment', icon: 'newspaper' },
    { id: 'competitors', label: 'Competitors', icon: 'query_stats' },
    { id: 'risks', label: 'Risks', icon: 'warning' },
  ];

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-container-high/20 via-background to-background"></div>
      </div>

      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-container-padding h-20 hidden md:flex">
        <div className="font-display-lg text-headline-md tracking-tighter text-primary">AlphaLens</div>
        <div className="flex items-center space-x-8">
          <span className="text-outline font-label-caps text-label-caps">{query}</span>
          <span className="text-outline font-label-caps text-label-caps opacity-50">VERDICT</span>
          <button className="text-primary hover:opacity-80 transition-opacity" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-section-gap px-6 md:px-container-padding max-w-[1600px] mx-auto min-h-screen flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-white/10 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-label-caps text-label-caps whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-on-surface-variant hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'verdict' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
              <div className="lg:col-span-7 space-y-12">
                <div className="space-y-4">
                  <div className={`inline-flex items-center space-x-2 border ${isInvest ? 'border-emerald-500/20' : isWatch ? 'border-amber-500/20' : 'border-red-500/20'} px-3 py-1 rounded-full`}>
                    <div className={`w-2 h-2 rounded-full ${dotClass} animate-pulse`} style={{ boxShadow: isInvest ? '0 0 20px rgba(52, 211, 153, 0.5)' : isWatch ? '0 0 20px rgba(251, 191, 36, 0.5)' : '0 0 20px rgba(248, 113, 113, 0.5)' }}></div>
                    <span className="font-label-caps text-label-caps text-on-surface">SYNTHESIS COMPLETE</span>
                  </div>
                  <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg leading-tight uppercase">
                    <span className="text-on-surface-variant opacity-60">{signalText}:</span> <br/>
                    <span className={`${colorClass}`} style={glowStyle}>{verdictText}</span>
                  </h1>
                </div>

                <div className={`backdrop-blur-[32px] border-[0.5px] p-8 rounded-lg relative overflow-hidden ${bgBorderClass}`}>
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <span className={`material-symbols-outlined text-[120px] ${colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isInvest ? 'verified' : isWatch ? 'visibility' : 'cancel'}
                    </span>
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-baseline space-x-4">
                      <span className={`font-display-lg text-[40px] leading-none uppercase ${confidenceColorClass}`}>{verdict.confidence} CONFIDENCE</span>
                    </div>
                    <p className="font-body-lg text-body-lg text-white max-w-2xl leading-relaxed">
                      AI Executive Summary: {verdict.summary}
                    </p>
                  </div>
                </div>
                
                {verdict.sources && verdict.sources.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-4">SOURCES CITED</h3>
                    <div className="flex flex-wrap gap-2">
                      {verdict.sources.map((source, idx) => (
                        <a key={idx} href={source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/20 text-sm text-on-surface-variant hover:text-primary hover:border-white/50 transition-colors">
                          <Newspaper className="h-4 w-4" />
                          {new URL(source).hostname.replace('www.', '')}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 space-y-gutter mt-12 lg:mt-0">
                <div className="bg-white/5 backdrop-blur-[32px] border-[0.5px] border-white/10 p-6 border-l-4 border-l-emerald-400">
                  <div className="font-label-caps text-label-caps text-emerald-400 mb-4 flex justify-between items-center">
                    <span>SUPPORTING FACTORS</span>
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  </div>
                  <ul className="space-y-4">
                    {verdict.supporting_factors.map((factor, idx) => (
                      <li key={idx} className="font-body-md text-body-md text-on-surface flex items-start space-x-3">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></span>
                        <span className="opacity-90">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 backdrop-blur-[32px] border-[0.5px] border-white/10 p-6 border-l-4 border-l-red-400">
                  <div className="font-label-caps text-label-caps text-red-400 mb-4 flex justify-between items-center">
                    <span>RISK FACTORS</span>
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                  </div>
                  <ul className="space-y-4">
                    {verdict.risk_factors.map((factor, idx) => (
                      <li key={idx} className="font-body-md text-body-md text-on-surface flex items-start space-x-3">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
                        <span className="opacity-90">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-6 text-center">
                  <button className="border-[0.5px] border-white/20 hover:border-white hover:bg-white/10 px-8 py-4 text-primary font-label-caps text-label-caps rounded flex items-center space-x-2 mx-auto transition-all" onClick={() => window.location.reload()}>
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                    <span>NEW ANALYSIS</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-8">
              {dimensions.financials?.success === false ? (
                <div className="bg-white/5 border border-red-500/20 p-8 rounded-lg text-center max-w-xl mx-auto my-8">
                  <span className="material-symbols-outlined text-[48px] text-red-400 mb-4">warning</span>
                  <h4 className="font-label-caps text-red-400 mb-2">Financials Unavailable</h4>
                  <p className="text-on-surface-variant text-sm">{dimensions.financials.error || "Financial data could not be retrieved for this company."}</p>
                </div>
              ) : dimensions.financials?.data ? (
                <>
                  {/* Company Profile (DNA) Section */}
                  {(dimensions.financials.data.description || dimensions.financials.data.sector || dimensions.financials.data.industry) && (
                    <div className="bg-white/5 border border-white/10 p-8 rounded-lg relative overflow-hidden">
                      <h3 className="font-label-caps text-primary mb-4">COMPANY PROFILE & DNA</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {dimensions.financials.data.sector && (
                          <div>
                            <span className="text-xs font-label-caps text-on-surface-variant block uppercase opacity-75">Sector</span>
                            <span className="text-white font-headline-md">{dimensions.financials.data.sector}</span>
                          </div>
                        )}
                        {dimensions.financials.data.industry && (
                          <div>
                            <span className="text-xs font-label-caps text-on-surface-variant block uppercase opacity-75">Industry</span>
                            <span className="text-white font-headline-md">{dimensions.financials.data.industry}</span>
                          </div>
                        )}
                        {dimensions.financials.data.website && (
                          <div>
                            <span className="text-xs font-label-caps text-on-surface-variant block uppercase opacity-75">Website</span>
                            <a href={dimensions.financials.data.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-headline-md flex items-center gap-1">
                              {dimensions.financials.data.website.replace(/^https?:\/\//, '')}
                              <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </a>
                          </div>
                        )}
                      </div>
                      {dimensions.financials.data.description && (
                        <div>
                          <span className="text-xs font-label-caps text-on-surface-variant block uppercase mb-2 opacity-75">Business Summary</span>
                          <p className="text-on-surface-variant leading-relaxed text-sm">{dimensions.financials.data.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Financial Stats Grid */}
                  <h3 className="font-label-caps text-on-surface-variant mt-8 mb-4">KEY FINANCIAL METRICS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(dimensions.financials.data)
                      .filter(([key]) => !['description', 'sector', 'industry', 'website'].includes(key))
                      .map(([key, val]) => {
                        const isPercentage = ['revenueGrowth', 'profitMargins', 'operatingMargins', 'grossMargins', 'returnOnEquity', 'earningsGrowth', 'dividendYield'].includes(key);
                        let displayVal = 'N/A';
                        if (typeof val === 'number') {
                          if (isPercentage) {
                            displayVal = (val * 100).toFixed(2) + '%';
                          } else if (val > 1000000000000) {
                            displayVal = '$' + (val / 1000000000000).toFixed(2) + 'T';
                          } else if (val > 1000000000) {
                            displayVal = '$' + (val / 1000000000).toFixed(2) + 'B';
                          } else if (val > 1000000) {
                            displayVal = '$' + (val / 1000000).toFixed(2) + 'M';
                          } else if (key.toLowerCase().includes('pe') || key.includes('Ratio') || key.includes('debtToEquity')) {
                            displayVal = val.toFixed(2) + 'x';
                          } else if (key === 'price' || key.toLowerCase().includes('high') || key.toLowerCase().includes('low')) {
                            displayVal = '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          } else {
                            displayVal = val.toLocaleString();
                          }
                        } else if (val) {
                          displayVal = val.toString().toUpperCase();
                        }

                        return (
                          <div key={key} className="bg-white/5 border border-white/10 p-6 rounded-lg flex flex-col justify-between">
                            <span className="font-label-caps text-on-surface-variant opacity-70 mb-4">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                            <span className="font-display-lg text-2xl text-white">
                              {displayVal}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div className="text-on-surface-variant">Loading...</div>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-8">
              {dimensions.news?.sentiment && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg flex flex-col items-center text-center">
                  <span className="font-label-caps text-on-surface-variant mb-2">AI SENTIMENT SCORE</span>
                  <div className="font-display-lg text-6xl text-primary mb-4">{dimensions.news.sentiment.score} / 100</div>
                  <p className="text-on-surface">{dimensions.news.sentiment.summary}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dimensions.news?.sources?.map((article, idx) => (
                  <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="block bg-white/5 border border-white/10 hover:border-primary/50 transition-colors p-6 rounded-lg">
                    <h3 className="font-headline-md text-white mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-on-surface-variant text-sm line-clamp-3">{article.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="space-y-8">
              {dimensions.competitors?.summary && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
                  <h3 className="font-label-caps text-primary mb-4">COMPETITIVE LANDSCAPE SYNTHESIS</h3>
                  <p className="text-on-surface leading-relaxed">{dimensions.competitors.summary}</p>
                </div>
              )}
              <h3 className="font-label-caps text-on-surface-variant mt-8 mb-4">RAW RESEARCH SOURCES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dimensions.competitors?.sources?.map((article, idx) => (
                  <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="block bg-white/5 border border-white/10 hover:border-primary/50 transition-colors p-6 rounded-lg">
                    <h3 className="font-headline-md text-white mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-on-surface-variant text-sm line-clamp-3">{article.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-8">
              {dimensions.risks?.summary && (
                <div className="bg-white/5 border border-error/20 p-6 rounded-lg border-l-4 border-l-error">
                  <h3 className="font-label-caps text-error mb-4">RISK SCANNER SYNTHESIS</h3>
                  <p className="text-on-surface leading-relaxed">{dimensions.risks.summary}</p>
                </div>
              )}
              <h3 className="font-label-caps text-on-surface-variant mt-8 mb-4">RAW RESEARCH SOURCES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dimensions.risks?.sources?.map((article, idx) => (
                  <a key={idx} href={article.link} target="_blank" rel="noreferrer" className="block bg-white/5 border border-white/10 hover:border-error/50 transition-colors p-6 rounded-lg">
                    <h3 className="font-headline-md text-white mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-on-surface-variant text-sm line-clamp-3">{article.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
