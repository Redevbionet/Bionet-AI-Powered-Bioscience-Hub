
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { SendIcon } from './IconComponents';

interface ChatPanelProps {
  isEmbedded?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isEmbedded = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.generateText(input);
      const botMessage: ChatMessage = { sender: 'bot', text: response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("ChatPanel Error:", err);
      const userFriendlyError = "Sorry, an error occurred. Please check your network connection and try again.";
      setError(userFriendlyError);
      const botMessage: ChatMessage = { sender: 'bot', text: userFriendlyError };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const containerClass = isEmbedded
    ? 'flex flex-col h-full bg-gray-800/50 rounded-2xl shadow-xl border border-gray-700'
    : 'h-full flex flex-col';

  return (
    <div className={containerClass}>
      {!isEmbedded && <h2 className="text-2xl font-bold text-cyan-400 mb-4 p-4 border-b border-gray-700">Chat Assistant</h2>}
      {isEmbedded && <h3 className="text-xl font-bold text-cyan-400 p-4">AI Assistant</h3>}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isEmbedded && (
            <div className="text-center text-gray-400">Ask me anything about Bionet or your research...</div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          </div>
        ))}
         {isLoading && <div className="flex justify-start"><div className="bg-gray-700 p-3 rounded-lg"><LoadingSpinner text="Thinking..." /></div></div>}
      </div>
      <div className="p-4 border-t border-gray-700">
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-cyan-500 text-white p-2 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
