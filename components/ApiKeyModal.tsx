
import React from 'react';

interface ApiKeyModalProps {
  onSelectKey: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSelectKey }) => {
  return (
    <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-cyan-500/30 max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">API Key Required for Video Generation</h2>
      <p className="text-gray-300 mb-6">
        The Veo video generation model requires you to select your own API key. 
        This is a mandatory step before you can generate videos. Please ensure your project is set up for billing.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onSelectKey}
          className="bg-cyan-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Select API Key
        </button>
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-700 text-gray-200 font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-300"
        >
          Billing Information
        </a>
      </div>
    </div>
  );
};

export default ApiKeyModal;
