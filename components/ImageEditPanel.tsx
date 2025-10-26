
import React, { useState, useCallback } from 'react';
import { fileToBase64 } from '../utils/helpers';
import * as geminiService from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { UploadIcon, SendIcon } from './IconComponents';

const ImageEditPanel: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<'analyze' | 'edit'>('analyze');

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResultImage(null);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = async () => {
    if (!imageFile || !prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResultImage(null);
    setAnalysis(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      if (activeTask === 'analyze') {
        const response = await geminiService.analyzeImage(prompt, imageFile.type, base64Image);
        setAnalysis(response);
      } else {
        const editedImageUrl = await geminiService.editImage(prompt, imageFile.type, base64Image);
        setResultImage(editedImageUrl);
      }
    } catch (err) {
      console.error("ImageEditPanel Error:", err);
      setError("The operation failed. Please ensure the image format is supported and your prompt doesn't violate safety policies. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4">Image Analysis & Edit</h2>
      <p className="text-gray-400 mb-6">Upload an image to ask questions about it or provide instructions to edit it.</p>
      
      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* Left Side: Upload and Preview */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 flex-grow flex flex-col justify-center items-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Upload preview" className="max-h-full max-w-full object-contain rounded-md" />
            ) : (
              <div className="text-center text-gray-500">
                <UploadIcon />
                <p>Upload an image to begin</p>
              </div>
            )}
          </div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="image-upload" className="w-full text-center bg-gray-700 text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
            {imageFile ? `Selected: ${imageFile.name}` : 'Choose Image'}
          </label>
        </div>

        {/* Right Side: Interaction and Results */}
        <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="flex bg-gray-800 rounded-lg p-1">
                <button onClick={() => setActiveTask('analyze')} className={`flex-1 py-2 rounded-md transition-colors ${activeTask === 'analyze' ? 'bg-cyan-500 text-white' : 'hover:bg-gray-700'}`}>Analyze</button>
                <button onClick={() => setActiveTask('edit')} className={`flex-1 py-2 rounded-md transition-colors ${activeTask === 'edit' ? 'bg-cyan-500 text-white' : 'hover:bg-gray-700'}`}>Edit</button>
            </div>
            <div className="flex-grow flex flex-col bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex-1 p-4 overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner text={activeTask === 'analyze' ? 'Analyzing...' : 'Editing...'} /></div>}
                    {error && <p className="text-red-400">{error}</p>}
                    {analysis && (
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Analysis Result</h3>
                            <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
                        </div>
                    )}
                    {resultImage && (
                        <div className="flex flex-col items-center gap-4">
                            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Edited Image</h3>
                            <img src={resultImage} alt="Edited" className="max-w-full max-h-[50vh] rounded-lg shadow-lg"/>
                        </div>
                    )}
                    {!isLoading && !analysis && !resultImage && (
                        <div className="text-center text-gray-500 h-full flex items-center justify-center">
                           <p>
                                {activeTask === 'analyze' 
                                ? 'Analysis results will appear here.' 
                                : 'Your edited image will appear here.'}
                            </p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-gray-700">
                     <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeTask === 'analyze' ? "e.g., What species is this plant?" : "e.g., Add a retro filter"}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-gray-200"
                            disabled={isLoading || !imageFile}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !prompt.trim() || !imageFile}
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

export default ImageEditPanel;
