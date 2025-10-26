
import React, { useState, useCallback, useEffect } from 'react';
import { fileToBase64 } from '../utils/helpers';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { UploadIcon } from './IconComponents';
import ApiKeyModal from './ApiKeyModal';

type AspectRatio = "16:9" | "9:16";

const loadingMessages = [
  "Initializing video synthesis...",
  "Analyzing image content...",
  "Generating primary motion vectors...",
  "Rendering keyframes...",
  "Interpolating intermediate frames...",
  "Applying post-processing effects...",
  "Optimizing video for playback...",
  "Finalizing video stream...",
];

const VideoGenPanel: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [isKeySelected, setIsKeySelected] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
        // Assume window.aistudio is available
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
            setIsKeySelected(true);
        }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setGeneratedVideo(null);
    }
  }, []);

  const handleSelectKey = async () => {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success after opening dialog to avoid race conditions
        setIsKeySelected(true);
      }
  };

  const handleGenerate = async () => {
    if (!imageFile || !prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedVideo(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const base64Image = await fileToBase64(imageFile);
      const videoUrl = await geminiService.generateVideoFromImage(prompt, imageFile.type, base64Image, aspectRatio);
      setGeneratedVideo(videoUrl);
    } catch (err) {
      console.error("VideoGenPanel Error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("Requested entity was not found")) {
        setError("API Key error. The selected API key is invalid or not properly configured for billing. Please re-select your key.");
        setIsKeySelected(false);
      } else {
        setError("Video generation failed. This can happen due to network issues or service load. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isKeySelected) {
    return <ApiKeyModal onSelectKey={handleSelectKey} />;
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Video Generation</h2>
      <p className="text-gray-400 mb-6">Upload a starting image and provide a prompt to generate a short video using Veo.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-hidden">
        {/* Left: Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex-grow bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex justify-center items-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Upload preview" className="max-h-full w-auto object-contain rounded-md" />
            ) : (
              <div className="text-center text-gray-500 flex flex-col items-center gap-2">
                <UploadIcon />
                <span>Upload an image</span>
              </div>
            )}
          </div>
          <input type="file" id="video-gen-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
          <label htmlFor="video-gen-upload" className="w-full text-center bg-gray-700 text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
            {imageFile ? `Selected: ${imageFile.name}` : 'Choose Starting Image'}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A neon hologram of a cat driving at top speed"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200 h-24 resize-none"
            disabled={isLoading}
          />
          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1">
                <label htmlFor="vidAspectRatio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                <select
                    id="vidAspectRatio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200 w-full"
                    disabled={isLoading}
                >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                </select>
            </div>
            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim() || !imageFile}
                className="self-end bg-cyan-500 flex-1 text-white p-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
            >
                Generate Video
            </button>
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex justify-center items-center">
            {isLoading && <LoadingSpinner text={loadingMessage} />}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {generatedVideo && (
                <video src={generatedVideo} controls autoPlay loop className="max-h-full w-auto rounded-lg shadow-lg" />
            )}
             {!isLoading && !generatedVideo && !error && (
                <div className="text-center text-gray-500">
                    <p>Your generated video will appear here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenPanel;
