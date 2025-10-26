
import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { SearchIcon } from './IconComponents';

interface GroundingSource {
    uri: string;
    title: string;
}

const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSources([]);

    try {
      const response = await geminiService.searchWithGrounding(query);
      setResult(response.text);
      setSources(response.sources);
    } catch (err) {
      console.error("SearchPanel Error:", err);
      setError("Search failed. This could be due to a network issue or the service being temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Grounding Search</h2>
      <p className="text-gray-400 mb-6">
        Get up-to-date and accurate information from the web. This tool uses Google Search to ground its responses in reality.
      </p>
      
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ask about recent events or trending topics..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="bg-cyan-500 text-white p-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          <SearchIcon />
          <span>Search</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {isLoading && <LoadingSpinner text="Searching the web..." />}
        {error && <p className="text-red-400">{error}</p>}
        
        {result && (
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Response</h3>
            <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />
            
            {sources.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-cyan-400 mb-3">Sources</h4>
                <ul className="list-disc list-inside space-y-2">
                  {sources.map((source, index) => (
                    <li key={index}>
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-cyan-500 hover:underline"
                      >
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {!isLoading && !result && !error && (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
                <p>Results will be displayed here.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
