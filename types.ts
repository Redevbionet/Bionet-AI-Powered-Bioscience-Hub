
export enum Tab {
  Dashboard = 'Dashboard',
  GeminiTools = 'Gemini Tools',
}

export enum Tool {
  Chat = 'Chat',
  Search = 'Grounding Search',
  ImageGen = 'Image Generation',
  ImageEdit = 'Image Analysis & Edit',
  VideoGen = 'Video Generation',
  VideoAnalysis = 'Video Analysis',
  Audio = 'Audio Tools',
  Live = 'Live Conversation',
  Complex = 'Complex Tasks',
  LowLatency = 'Low-Latency',
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  sources?: { uri: string; title: string }[];
}
