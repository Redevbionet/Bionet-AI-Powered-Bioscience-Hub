
import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { BoltIcon } from './IconComponents';

const LowLatencyPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.getLowLatencyResponse(prompt);
      setResult(response);
    } catch (err) {
      console.error("LowLatencyPanel Error:", err);
      setError("Could not get a response. Please check your network connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Low-Latency Responses</h2>
      <p className="text-gray-400 mb-6">
        Get lightning-fast answers. This tool uses Gemini 2.5 Flash-Lite, optimized for speed and efficiency.
      </p>
      
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Ask a quick question..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="bg-yellow-500 text-gray-900 p-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-yellow-400 transition-colors flex items-center gap-2"
        >
          <BoltIcon />
          <span>Get Fast Answer</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {isLoading && <LoadingSpinner text="Getting response..." />}
        {error && <p className="text-red-400">{error}</p>}
        
        {result && (
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Response</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{result}</p>
          </div>
        )}
        {!isLoading && !result && !error && (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
                <p>Fast responses will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LowLatencyPanel;
