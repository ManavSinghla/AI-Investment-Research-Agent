import React, { useState } from 'react';
import LensField from './LensField';

export default function LandingView({ query, onQueryChange, isSearching, onSearch, candidates, history, onSelectHistory }) {
  const [wallet, setWallet] = useState({ status: 'disconnected', address: '' });

  const handleConnect = () => {
    setWallet({ status: 'connecting', address: '' });
    setTimeout(() => {
      setWallet({ status: 'connected', address: '0x71C...8E5' });
    }, 1000);
  };

  return (
    <>
      <LensField className="fixed inset-0 z-0 w-full h-full pointer-events-none" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#141313_100%)]"></div>
      
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding h-20 bg-surface/15 backdrop-blur-32 border-b border-white/10 hidden md:flex">
        <div className="font-headline-md text-headline-md text-primary tracking-tighter flex items-center gap-2">
          AlphaLens
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleConnect}
            disabled={wallet.status === 'connecting'}
            className="font-label-caps text-label-caps uppercase border-[0.5px] border-white/20 px-6 py-2.5 rounded hover:border-white hover:bg-white/10 transition-all duration-300 tracking-[0.1em] flex items-center space-x-2"
          >
            {wallet.status === 'disconnected' && <span>Connect Wallet</span>}
            {wallet.status === 'connecting' && <span>Connecting...</span>}
            {wallet.status === 'connected' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>{wallet.address}</span>
              </>
            )}
          </button>
        </div>
      </nav>

      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-surface/15 backdrop-blur-32 border-b border-white/10 md:hidden">
        <div className="font-display-lg-mobile text-display-lg-mobile tracking-tighter text-primary">
          AlphaLens
        </div>
        <button 
          onClick={handleConnect}
          disabled={wallet.status === 'connecting'}
          className="text-xs font-label-caps border border-white/15 px-3 py-1.5 rounded text-white flex items-center space-x-1"
        >
          {wallet.status === 'disconnected' && <span>Connect</span>}
          {wallet.status === 'connecting' && <span>...</span>}
          {wallet.status === 'connected' && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>{wallet.address}</span>
            </>
          )}
        </button>
      </nav>

      <main className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 md:px-container-padding pt-32 pb-24">
        <div className="max-w-4xl w-full mx-auto text-center flex flex-col items-center mt-12 md:mt-0">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 animate-fade-in-up" style={{ textShadow: '0 0 40px rgba(255, 255, 255, 0.1)' }}>
            See What The Market Doesn't.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-12 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            AI-powered investment research that analyzes companies, identifies opportunities, surfaces risks, and explains every decision.
          </p>
          
          <form onSubmit={onSearch} className="w-full max-w-2xl animate-fade-in-up mb-12" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <div className="bg-white/5 backdrop-blur-32 border-[0.5px] border-white/10 rounded-lg p-2 flex items-center relative group">
              <span className="material-symbols-outlined text-on-surface-variant ml-4 mr-2 group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-transparent border-none text-primary font-mono-data text-mono-data placeholder:text-on-surface-variant/50 h-12 focus:ring-0 outline-none" 
                placeholder="Enter company name..." 
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                disabled={isSearching}
              />
              <div className="absolute inset-0 rounded-lg border border-white/0 group-focus-within:border-white/30 transition-colors pointer-events-none"></div>
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="mr-2 text-on-primary bg-primary px-4 py-2 rounded font-label-caps uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Analyze
              </button>
            </div>
            
            {candidates && candidates.length > 0 && (
              <div className="mt-8 bg-white/5 border border-primary/30 p-6 rounded-lg text-left animate-fade-in-up">
                <h3 className="text-primary font-label-caps mb-4">Multiple Companies Found. Please Select:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.map((c, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      onClick={() => {
                        onQueryChange(c.ticker || c.name);
                        // Using timeout to ensure state updates before submitting
                        setTimeout(() => onSearch({ preventDefault: () => {} }), 50);
                      }}
                      className="bg-background/50 hover:bg-white/10 border border-white/10 p-4 rounded text-left transition-colors"
                    >
                      <div className="text-white font-headline-md">{c.name}</div>
                      <div className="text-on-surface-variant text-sm mt-1">{c.ticker ? `Ticker: ${c.ticker}` : 'Private / No Ticker'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up mb-16" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <span className="text-on-surface-variant/60 font-label-caps text-[10px] uppercase tracking-widest mr-2 flex items-center">Trending</span>
            {['NVIDIA', 'Microsoft', 'Apple', 'Amazon', 'Tesla'].map(company => (
              <button 
                key={company} 
                onClick={() => onQueryChange(company)}
                className="px-4 py-1.5 rounded-full border border-white/10 text-on-surface text-label-caps font-label-caps hover:bg-white/5 hover:border-white/30 transition-all uppercase"
              >
                {company}
              </button>
            ))}
          </div>

          {history && history.length > 0 && (
            <div className="w-full max-w-2xl text-left animate-fade-in-up mt-8" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
              <div className="text-on-surface-variant/60 font-label-caps text-[10px] uppercase tracking-widest mb-4">Recent Research Reports</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectHistory(item)}
                    className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all bg-white/5 backdrop-blur-32 text-left w-full group"
                  >
                    <div>
                      <div className="text-white font-headline-md text-sm group-hover:text-primary transition-colors">{item.query}</div>
                      <div className="text-on-surface-variant text-xs mt-1">{new Date(item.date).toLocaleDateString()}</div>
                    </div>
                    {(() => {
                      const verdictVal = item.verdict?.verdict?.toUpperCase() || 'UNKNOWN';
                      const isInvest = verdictVal === 'INVEST' || verdictVal === 'BUY';
                      const isWatch = verdictVal === 'WATCH' || verdictVal === 'HOLD';
                      
                      const badgeClass = isInvest
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isWatch
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20';

                      return (
                        <div className={`px-2.5 py-1 rounded font-label-caps text-[10px] uppercase tracking-widest ${badgeClass}`}>
                          {verdictVal}
                        </div>
                      );
                    })()}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
