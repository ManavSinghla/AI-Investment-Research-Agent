import React from 'react';
import { Newspaper } from 'lucide-react';

export default function DashboardView({ query, verdict, error }) {
  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-on-background z-50">
        <span className="material-symbols-outlined text-[64px] text-error mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
        <h1 className="font-headline-md text-2xl text-error mb-2">Research Failed</h1>
        <p className="text-on-surface-variant max-w-md text-center">{error}</p>
        <button className="mt-8 px-6 py-2 border border-white/20 rounded hover:bg-white/10" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  if (!verdict) return null;

  // Determine colors based on verdict
  const isInvest = verdict.verdict.toUpperCase() === 'INVEST' || verdict.verdict.toUpperCase() === 'BUY';
  const isWatch = verdict.verdict.toUpperCase() === 'WATCH' || verdict.verdict.toUpperCase() === 'HOLD';
  const signalText = isInvest ? 'BUY SIGNAL' : isWatch ? 'HOLD SIGNAL' : 'PASS SIGNAL';
  const verdictText = verdict.verdict.toUpperCase();

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface-container-high/20 via-background to-background"></div>
      </div>

      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-container-padding h-20 hidden md:flex">
        <div className="font-display-lg text-headline-md tracking-tighter text-primary">AlphaLens</div>
        <div className="flex items-center space-x-8">
          <span className="text-outline font-label-caps text-label-caps">{query}</span>
          <span className="text-outline font-label-caps text-label-caps opacity-50">STAGE VIII : VERDICT</span>
          <button className="text-primary hover:opacity-80 transition-opacity" onClick={() => window.location.reload()}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-section-gap px-6 md:px-container-padding max-w-[1600px] mx-auto min-h-screen flex flex-col justify-center">
        <div className="absolute top-1/4 -left-20 opacity-[0.02] pointer-events-none transform -rotate-90 origin-left hidden md:block">
          <h1 className="font-display-lg text-[240px] whitespace-nowrap text-white">STAGE VIII</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 border border-white/10 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: '0 0 20px rgba(255,255,255,0.05)' }}></div>
                <span className="font-label-caps text-label-caps text-on-surface">SYNTHESIS COMPLETE</span>
              </div>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary leading-tight uppercase">
                {signalText}: <br/>
                <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{verdictText}</span>
              </h1>
            </div>

            <div className="bg-white/5 backdrop-blur-[32px] border-[0.5px] border-white/10 p-8 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-baseline space-x-4">
                  <span className="font-display-lg text-[40px] text-primary leading-none uppercase">{verdict.confidence} CONFIDENCE</span>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
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
            <div className="bg-white/5 backdrop-blur-[32px] border-[0.5px] border-white/10 p-6 border-l-4 border-l-white">
              <div className="font-label-caps text-label-caps text-on-surface-variant mb-4 flex justify-between items-center">
                <span>SUPPORTING FACTORS</span>
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
              </div>
              <ul className="space-y-4">
                {verdict.supporting_factors.map((factor, idx) => (
                  <li key={idx} className="font-body-md text-body-md text-on-surface flex items-start space-x-3">
                    <span className="mt-1 w-1.5 h-1.5 bg-white rounded-full flex-shrink-0"></span>
                    <span className="opacity-80">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-[32px] border-[0.5px] border-white/10 p-6 border-l-4 border-l-error">
              <div className="font-label-caps text-label-caps text-on-surface-variant mb-4 flex justify-between items-center">
                <span>RISK FACTORS</span>
                <span className="material-symbols-outlined text-[16px]">warning</span>
              </div>
              <ul className="space-y-4">
                {verdict.risk_factors.map((factor, idx) => (
                  <li key={idx} className="font-body-md text-body-md text-on-surface flex items-start space-x-3">
                    <span className="mt-1 w-1.5 h-1.5 bg-error rounded-full flex-shrink-0"></span>
                    <span className="opacity-80">{factor}</span>
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
      </main>
    </>
  );
}
