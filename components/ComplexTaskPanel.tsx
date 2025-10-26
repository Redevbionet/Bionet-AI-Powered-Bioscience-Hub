
import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { BrainIcon } from './IconComponents';

const ComplexTaskPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await geminiService.performComplexTask(prompt);
      setResult(response);
    } catch (err) {
      console.error("ComplexTaskPanel Error:", err);
      setError("Processing failed. The task may be too complex, violate safety policies, or have timed out. Please try simplifying your prompt or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Complex Tasks (Thinking Mode)</h2>
      <p className="text-gray-400 mb-6">
        Tackle your most complex queries. This tool uses Gemini 2.5 Pro with its maximum thinking budget for advanced reasoning, coding, and problem-solving.
      </p>
      
      <div className="space-y-4 mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a complex prompt, e.g., 'Design a database schema for a multi-tenant lab inventory system and generate Python code to interact with it.'"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200 h-40 resize-y"
          disabled={isLoading}
        />
        <button
          onClick={handleProcess}
          disabled={isLoading || !prompt.trim()}
          className="bg-purple-600 w-full text-white p-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-purple-500 transition-colors flex items-center justify-center gap-2"
        >
          <BrainIcon />
          <span>Process with Thinking Mode</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {isLoading && <LoadingSpinner text="Deep thinking in progress..." />}
        {error && <p className="text-red-400">{error}</p>}
        
        {result && (
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Result</h3>
            <pre className="whitespace-pre-wrap font-mono text-gray-300 bg-gray-900 p-4 rounded-md">{result}</pre>
          </div>
        )}
        {!isLoading && !result && !error && (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
                <p>Results of complex processing will be displayed here.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ComplexTaskPanel;
