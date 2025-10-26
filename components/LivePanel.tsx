
import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as geminiService from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

const LivePanel: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [history, setHistory] = useState<{ user: string; model: string }[]>([]);
    
    const currentUserTranscriptionRef = useRef('');
    const currentModelTranscriptionRef = useRef('');
    const [liveUserTranscription, setLiveUserTranscription] = useState('');
    const [liveModelTranscription, setLiveModelTranscription] = useState('');

    const sessionRef = useRef<Awaited<ReturnType<typeof geminiService.startLiveSession>> | null>(null);

    const onMessage = useCallback((message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
            currentUserTranscriptionRef.current += message.serverContent.inputTranscription.text;
            setLiveUserTranscription(currentUserTranscriptionRef.current);
        }
        if (message.serverContent?.outputTranscription) {
            currentModelTranscriptionRef.current += message.serverContent.outputTranscription.text;
            setLiveModelTranscription(currentModelTranscriptionRef.current);
        }
        if (message.serverContent?.turnComplete) {
            setHistory(prev => [...prev, {
                user: currentUserTranscriptionRef.current.trim(),
                model: currentModelTranscriptionRef.current.trim()
            }]);
            currentUserTranscriptionRef.current = '';
            currentModelTranscriptionRef.current = '';
            setLiveUserTranscription('');
            setLiveModelTranscription('');
        }
    }, []);

    const onError = useCallback((e: ErrorEvent) => {
        console.error('Live session error:', e);
        setConnectionState('error');
        sessionRef.current?.close();
        sessionRef.current = null;
    }, []);

    const onClose = useCallback(() => {
        setConnectionState('disconnected');
        sessionRef.current = null;
    }, []);

    const startConversation = useCallback(async () => {
        setConnectionState('connecting');
        setHistory([]);
        try {
            const session = await geminiService.startLiveSession({ onMessage, onError, onClose });
            sessionRef.current = session;
            setConnectionState('connected');
        } catch (e) {
            console.error('Failed to start live session:', e);
            setConnectionState('error');
        }
    }, [onMessage, onError, onClose]);

    const stopConversation = useCallback(() => {
        sessionRef.current?.close();
    }, []);
    
    useEffect(() => {
        return () => {
            sessionRef.current?.close();
        }
    }, []);

    const getButtonText = () => {
        switch (connectionState) {
            case 'connected': return 'Stop Conversation';
            case 'connecting': return 'Connecting...';
            case 'error': return 'Retry Connection';
            default: return 'Start Conversation';
        }
    };
    
    const handleButtonClick = () => {
        if (connectionState === 'connected') {
            stopConversation();
        } else {
            startConversation();
        }
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Live Conversation</h2>
            <p className="text-gray-400 mb-6">
                Have a real-time voice conversation with Gemini. Press start and begin speaking.
            </p>
            <div className="flex justify-center mb-6">
                <button
                    onClick={handleButtonClick}
                    disabled={connectionState === 'connecting'}
                    className={`px-8 py-4 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-lg ${
                        connectionState === 'connected' ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 
                        connectionState === 'connecting' ? 'bg-gray-600 cursor-not-allowed' :
                        'bg-cyan-500 hover:bg-cyan-600'
                    }`}
                >
                    {getButtonText()}
                </button>
            </div>
            
            <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 p-4 overflow-y-auto space-y-4">
                {history.map((turn, index) => (
                    <div key={index}>
                        <p className="text-cyan-300 font-semibold">You:</p>
                        <p className="text-gray-300 pl-4">{turn.user}</p>
                        <p className="text-purple-300 font-semibold mt-2">Bionet AI:</p>
                        <p className="text-gray-300 pl-4">{turn.model}</p>
                    </div>
                ))}
                {connectionState === 'connected' && (
                    <div>
                        {liveUserTranscription && (
                            <>
                                <p className="text-cyan-300 font-semibold">You:</p>
                                <p className="text-gray-300 pl-4">{liveUserTranscription}</p>
                            </>
                        )}
                        {liveModelTranscription && (
                             <>
                                <p className="text-purple-300 font-semibold mt-2">Bionet AI:</p>
                                <p className="text-gray-300 pl-4">{liveModelTranscription}</p>
                            </>
                        )}
                         {(!liveUserTranscription && !liveModelTranscription && history.length === 0) && (
                            <p className="text-gray-500 text-center">Listening...</p>
                         )}
                    </div>
                )}
                 {connectionState === 'disconnected' && history.length === 0 && (
                    <p className="text-gray-500 text-center">Press 'Start Conversation' to begin.</p>
                )}
                {connectionState === 'error' && (
                    <p className="text-red-400 text-center">A connection error occurred. Please try again.</p>
                )}
            </div>
        </div>
    );
};

export default LivePanel;
