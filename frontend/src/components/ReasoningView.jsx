import React from 'react';
import Loader from './Loader';

export default function ReasoningView({ logs }) {
  // Take up to the last 4 logs
  const displayLogs = logs.slice(-4);
  const currentLog = displayLogs.length > 0 ? displayLogs[displayLogs.length - 1] : "Initializing reasoning engine...";

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#141313_100%)]"></div>
      
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-container-padding h-20 w-full">
        <div className="font-headline-md text-headline-md tracking-tighter text-primary">
          ALPHALENS
        </div>
      </nav>

      <main className="relative z-10 pt-[120px] px-6 md:px-container-padding h-screen flex flex-col pointer-events-none">
        <header className="mb-12 flex flex-col items-center text-center">
          <div className="font-label-caps text-label-caps text-on-surface-variant tracking-[0.2em] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            RESEARCH PHASE
          </div>
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary">The Reasoning Layer</h1>
        </header>

        <div className="w-full max-w-5xl mx-auto mb-24 relative hidden md:block">
          <div className="absolute top-1/2 left-0 w-full -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent h-[1px]"></div>
          <div className="flex justify-between items-center bg-surface-container-lowest/50 backdrop-blur-2xl rounded-full px-8 py-4 border border-white/10">
            {['Data Ingestion', 'Financial Extraction', 'Sentiment Analysis', 'Risk Modeling', 'Verdict Synthesis'].map((step, idx) => {
               // Simple mock state based on log count to light up steps
               const isActive = logs.length >= idx;
               const isCurrent = logs.length === idx;
               return (
                 <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                   {isActive ? (
                     <div className={`w-4 h-4 rounded-full ${isCurrent ? 'bg-primary border-primary shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-primary/20 border border-primary/50'} flex items-center justify-center`}>
                       {!isCurrent && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                     </div>
                   ) : (
                     <div className="w-4 h-4 rounded-full bg-surface-container border border-white/20 flex items-center justify-center"></div>
                   )}
                   <span className={`font-mono-data text-[10px] ${isActive ? 'text-primary' : 'text-on-surface-variant/50'}`}>{step}</span>
                 </div>
               )
            })}
          </div>
        </div>

        <div className="flex-1 flex w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 relative">
          <div className="col-span-1 md:col-span-4 flex flex-col justify-end pb-24">
            <div className="font-label-caps text-label-caps text-on-surface-variant mb-6 border-b border-white/10 pb-2">Active Logic Threads</div>
            <div className="flex flex-col gap-4 font-mono-data text-mono-data text-sm opacity-80">
              {displayLogs.map((log, idx) => {
                const isLast = idx === displayLogs.length - 1;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <span className={`mt-0.5 ${isLast ? 'text-primary' : 'text-primary opacity-50'}`}>›</span>
                    <span className={isLast ? 'text-primary' : 'text-on-surface-variant'}>
                      {log}
                      {isLast && <span className="inline-block w-[2px] h-[14px] bg-white animate-pulse align-middle ml-1"></span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="col-span-1 md:col-span-8 flex items-center justify-center pb-24">
            <Loader />
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto mb-16 relative">
          <div className="bg-surface-container-lowest/30 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex items-start gap-6">
              <div className="mt-1">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="font-label-caps text-label-caps text-on-surface-variant">AI THINKING PROCESS</div>
                <p className="font-body-lg text-body-lg text-on-surface leading-relaxed max-w-2xl">
                  {currentLog}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
