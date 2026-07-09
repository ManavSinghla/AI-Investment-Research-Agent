import LensField from './LensField';
import SearchInput from './search';
import Loader from './Loader';

export default function LandingView({ query, onQueryChange, isSearching, onSearch, candidates, history, onSelectHistory }) {
  return (
    <>
      <LensField className="fixed inset-0 z-0 w-full h-full pointer-events-none" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#141313_100%)]"></div>
      
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding h-20 bg-surface/15 backdrop-blur-32 border-b border-white/10 hidden md:flex">
        <div className="font-headline-md text-headline-md text-primary tracking-tighter flex items-center gap-2">
          AlphaLens
        </div>
      </nav>

      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-surface/15 backdrop-blur-32 border-b border-white/10 md:hidden">
        <div className="font-display-lg-mobile text-display-lg-mobile tracking-tighter text-primary">
          AlphaLens
        </div>
      </nav>

      <main className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 md:px-container-padding pt-32 pb-24">
        <div className="max-w-4xl w-full mx-auto text-center flex flex-col items-center mt-12 md:mt-0">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 animate-fade-in-up" style={{ textShadow: '0 0 40px rgba(255, 255, 255, 0.1)' }}>
            See What The Market Doesn't.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-12 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            AI-powered investment research that analyzes companies, identifies opportunities, surfaces risks, and explains every decision.
          </p>
          
          <form onSubmit={onSearch} className="w-full max-w-2xl animate-fade-in-up mb-12 flex flex-col items-center justify-center" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <SearchInput 
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              disabled={isSearching}
              isSearching={isSearching}
              placeholder="Enter company name..."
            />
            
            {candidates && candidates.length > 0 && !isSearching && (
              <div className="mt-8 bg-white/5 border border-primary/30 p-6 rounded-lg text-left animate-fade-in-up w-full">
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
