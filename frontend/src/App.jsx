import { useState } from 'react';
import LandingView from './components/LandingView';
import ReasoningView from './components/ReasoningView';
import DashboardView from './components/DashboardView';

function App() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [logs, setLogs] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState(null);
  const [rawDimensions, setRawDimensions] = useState({});
  const [view, setView] = useState('landing'); // 'landing' | 'reasoning' | 'dashboard'

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!query.trim()) return;

    setLogs([]);
    setVerdict(null);
    setCandidates(null);
    setRawDimensions({});
    setError(null);
    setIsSearching(true);
    setView('reasoning');

    const eventSource = new EventSource(`http://localhost:3001/api/research?company=${encodeURIComponent(query)}`);

    eventSource.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        setLogs((prev) => [...prev, data.message]);
      } catch(err) { }
    });

    eventSource.addEventListener('result', (e) => {
      try {
        const data = JSON.parse(e.data);
        setVerdict(data);
      } catch(err) { }
    });

    ['financials', 'news', 'competitors', 'risks'].forEach(dim => {
      eventSource.addEventListener(`dimension_${dim}`, (e) => {
        try {
          const data = JSON.parse(e.data);
          setRawDimensions(prev => ({ ...prev, [dim]: data }));
        } catch(err) { }
      });
    });

    eventSource.addEventListener('ambiguous', (e) => {
      try {
        const data = JSON.parse(e.data);
        setCandidates(data.candidates);
        setIsSearching(false);
        setView('landing');
        eventSource.close();
      } catch(err) { }
    });

    eventSource.addEventListener('done', (e) => {
      setIsSearching(false);
      setView('dashboard');
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      try {
        const data = JSON.parse(e.data);
        setError(data.message || "An error occurred.");
      } catch (err) {
        setError("An error occurred connecting to the server.");
      }
      setIsSearching(false);
      setView('dashboard');
      eventSource.close();
    });
  };

  const handleQueryChange = (val) => {
    setQuery(val);
    if (!isSearching && val && val.length > 0 && view === 'landing') {
      // Allow clicking trending to auto search if desired, but here we just set it
    }
  };

  return (
    <>
      {view === 'landing' && (
        <LandingView 
          query={query} 
          onQueryChange={handleQueryChange} 
          onSearch={handleSearch} 
          candidates={candidates}
          isSearching={isSearching} 
        />
      )}
      
      {view === 'reasoning' && (
        <ReasoningView logs={logs} />
      )}
      
      {view === 'dashboard' && (
        <DashboardView query={query} verdict={verdict} error={error} dimensions={rawDimensions} />
      )}
    </>
  );
}

export default App;
