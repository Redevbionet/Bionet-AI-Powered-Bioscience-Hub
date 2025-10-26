
import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../utils/helpers';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { UploadIcon, SendIcon } from './IconComponents';

const MAX_FILE_SIZE_MB = 20; // Example limit
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const VideoAnalysisPanel: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
      setError(null);
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = async () => {
    if (!videoFile || !prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const base64Video = await fileToBase64(videoFile);
      const response = await geminiService.analyzeVideo(prompt, videoFile.type, base64Video);
      setAnalysis(response);
    } catch (err) {
      console.error("VideoAnalysisPanel Error:", err);
      setError("Video analysis failed. The video might be too long, in an unsupported format, or corrupted. Please try a different video.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Video Analysis</h2>
      <p className="text-gray-400 mb-6">Upload a video to analyze its content for key information using Gemini Pro.</p>
      
      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* Left Side: Upload and Preview */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex-grow flex flex-col justify-center items-center">
            {videoPreview ? (
              <video src={videoPreview} controls className="max-h-full max-w-full rounded-md" />
            ) : (
              <div className="text-center text-gray-500">
                <UploadIcon />
                <p>Upload a video to begin</p>
                <p className="text-xs mt-1">(Max {MAX_FILE_SIZE_MB}MB)</p>
              </div>
            )}
          </div>
          <input
            type="file"
            id="video-upload"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="video-upload" className="w-full text-center bg-gray-700 text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
            {videoFile ? `Selected: ${videoFile.name}` : 'Choose Video'}
          </label>
        </div>

        {/* Right Side: Interaction and Results */}
        <div className="lg:w-1/2 flex flex-col">
            <div className="flex-grow flex flex-col bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex-1 p-4 overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner text="Analyzing video..." /></div>}
                    {error && !videoFile && <p className="text-red-400">{error}</p>}
                    {analysis && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Analysis Result</h3>
                            <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
                        </div>
                    )}
                    {!isLoading && !analysis && (
                        <div className="text-center text-gray-500 h-full flex items-center justify-center">
                           <p>Analysis results will appear here.</p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-700">
                     <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Summarize the key points of this lecture."
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200"
                            disabled={isLoading || !videoFile}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !prompt.trim() || !videoFile}
                            className="bg-cyan-500 text-white p-2 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysisPanel;
