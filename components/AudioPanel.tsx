
import React, { useState, useRef, useCallback } from 'react';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const AudioPanel: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [ttsText, setTtsText] = useState('');
    const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleTranscription;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setTranscription('');
            setError(null);
        } catch (err) {
            setError('Microphone access denied or not available.');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsTranscribing(true);
        }
    };

    const handleTranscription = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
            const result = await geminiService.transcribeAudio(audioBlob);
            setTranscription(result);
        } catch (err) {
            console.error("Transcription Error:", err);
            setError("Transcription failed. The audio might be unclear or in an unsupported format. Please try recording again in a quieter environment.");
        } finally {
            setIsTranscribing(false);
            audioChunksRef.current = [];
        }
    };
    
    const handleGenerateSpeech = async () => {
        if (!ttsText.trim() || isGeneratingSpeech) return;
        setIsGeneratingSpeech(true);
        setError(null);
        try {
            await geminiService.generateSpeech(ttsText);
        } catch (err) {
            console.error("TTS Error:", err);
            setError("Could not generate speech. There might be an issue with the service. Please try again later.");
        } finally {
            setIsGeneratingSpeech(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-8">
            {/* Transcription Section */}
            <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Audio Transcription</h2>
                <p className="text-gray-400 mb-6">Record audio from your microphone and get a real-time transcription.</p>
                <div className="flex justify-center items-center gap-4 mb-6">
                    <button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`px-6 py-3 rounded-full text-white font-semibold transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}
                    >
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                </div>
                <div className="flex-1 bg-gray-800/50 rounded-lg border border-gray-700 p-4 overflow-y-auto">
                    {isTranscribing && <LoadingSpinner text="Transcribing..." />}
                    {!isTranscribing && transcription && <p className="text-gray-200 whitespace-pre-wrap">{transcription}</p>}
                    {!isTranscribing && !transcription && <p className="text-gray-500 text-center">Your transcription will appear here.</p>}
                </div>
            </div>

            {/* TTS Section */}
            <div className="flex-1 flex flex-col">
                 <h2 className="text-2xl font-bold text-cyan-400 mb-4">Text-to-Speech (TTS)</h2>
                 <p className="text-gray-400 mb-6">Convert text into natural-sounding speech.</p>
                 <textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    placeholder="Enter text to generate speech..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200 h-32 resize-none mb-4"
                    disabled={isGeneratingSpeech}
                 />
                 <button
                    onClick={handleGenerateSpeech}
                    disabled={isGeneratingSpeech || !ttsText.trim()}
                    className="w-full bg-cyan-500 text-white p-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
                >
                    {isGeneratingSpeech ? 'Generating...' : 'Generate Speech'}
                </button>
            </div>
             {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>
    );
};

export default AudioPanel;
