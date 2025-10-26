
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { fileToBase64 } from '../utils/helpers';

// This is a placeholder for the browser environment where aistudio is available.
// FIX: Removed conflicting global Window interface declaration.
// The build environment is expected to provide the necessary global types.
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- Text Generation ---
export const generateText = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const getLowLatencyResponse = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text;
};

export const performComplexTask = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
};

// --- Search Grounding ---
export const searchWithGrounding = async (query: string) => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .map(chunk => chunk.web)
        .filter(web => web && web.uri)
        .map(web => ({ uri: web.uri!, title: web.title! }));

    return { text: response.text, sources };
};

// --- Image Generation & Editing ---
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
    },
  });
  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const analyzeImage = async (prompt: string, mimeType: string, base64Image: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: prompt },
      ],
    },
  });
  return response.text;
};

export const editImage = async (prompt: string, mimeType: string, base64Image: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error('No edited image was returned from the API.');
};

// --- Video Generation & Analysis ---
export const generateVideoFromImage = async (prompt: string, mimeType: string, base64Image: string, aspectRatio: "16:9" | "9:16"): Promise<string> => {
  const ai = getAiClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    image: { imageBytes: base64Image, mimeType },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Video generation completed but no download link was provided.");
  }
  
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if(!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};

export const analyzeVideo = async (prompt: string, mimeType: string, base64Video: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Video }},
                { text: prompt }
            ]
        }
    });
    return response.text;
}

// --- Audio ---
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const ai = getAiClient();
    const base64Audio = await fileToBase64(audioBlob as File);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [{ inlineData: { mimeType: audioBlob.type, data: base64Audio } }]
        }
    });
    return response.text;
};

export const generateSpeech = async (text: string): Promise<void> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, outputAudioContext, 24000, 1);
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.destination);
        source.start();
    } else {
        throw new Error('No audio data received from API.');
    }
};

// --- Live Conversation ---
interface LiveSessionCallbacks {
    onMessage: (message: LiveServerMessage) => void;
    onError: (e: ErrorEvent) => void;
    onClose: () => void;
}

export const startLiveSession = async (callbacks: LiveSessionCallbacks) => {
    const ai = getAiClient();
    const inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    let nextStartTime = 0;
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const onOpen = (sessionPromise: Promise<any>) => {
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
    };
    
    const onMessageWrapper = async (message: LiveServerMessage) => {
        callbacks.onMessage(message);
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if(base64Audio) {
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
        }
    };
    
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => onOpen(sessionPromise),
            onmessage: onMessageWrapper,
            onerror: callbacks.onError,
            onclose: callbacks.onClose,
        },
        config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
        },
    });

    return {
        close: async () => {
            const session = await sessionPromise;
            stream.getTracks().forEach(track => track.stop());
            await inputAudioContext.close();
            await outputAudioContext.close();
            session.close();
        }
    }
};


// --- Audio Utils (as per docs) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
