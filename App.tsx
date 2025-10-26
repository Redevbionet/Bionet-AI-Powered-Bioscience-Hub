
import React, { useState, useMemo } from 'react';
import { Tab, Tool } from './types';
import { BionetIcon, DashboardIcon, ToolsIcon, ChatIcon, SearchIcon, ImageIcon, VideoIcon, AudioIcon, BrainIcon, BoltIcon, LiveIcon } from './components/IconComponents';
import DashboardPanel from './components/DashboardPanel';
import ChatPanel from './components/ChatPanel';
import SearchPanel from './components/SearchPanel';
import ImageGenPanel from './components/ImageGenPanel';
import ImageEditPanel from './components/ImageEditPanel';
import VideoGenPanel from './components/VideoGenPanel';
import VideoAnalysisPanel from './components/VideoAnalysisPanel';
import AudioPanel from './components/AudioPanel';
import LivePanel from './components/LivePanel';
import ComplexTaskPanel from './components/ComplexTaskPanel';
import LowLatencyPanel from './components/LowLatencyPanel';


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [activeTool, setActiveTool] = useState<Tool>(Tool.Chat);

  const toolComponents: Record<Tool, React.ReactElement> = useMemo(() => ({
    [Tool.Chat]: <ChatPanel />,
    [Tool.Search]: <SearchPanel />,
    [Tool.ImageGen]: <ImageGenPanel />,
    [Tool.ImageEdit]: <ImageEditPanel />,
    [Tool.VideoGen]: <VideoGenPanel />,
    [Tool.VideoAnalysis]: <VideoAnalysisPanel />,
    [Tool.Audio]: <AudioPanel />,
    [Tool.Live]: <LivePanel />,
    [Tool.Complex]: <ComplexTaskPanel />,
    [Tool.LowLatency]: <LowLatencyPanel />,
  }), []);

  const toolIcons: Record<Tool, React.ReactElement> = {
    [Tool.Chat]: <ChatIcon />,
    [Tool.Search]: <SearchIcon />,
    [Tool.ImageGen]: <ImageIcon />,
    [Tool.ImageEdit]: <ImageIcon />,
    [Tool.VideoGen]: <VideoIcon />,
    [Tool.VideoAnalysis]: <VideoIcon />,
    [Tool.Audio]: <AudioIcon />,
    [Tool.Live]: <LiveIcon />,
    [Tool.Complex]: <BrainIcon />,
    [Tool.LowLatency]: <BoltIcon />,
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case Tab.Dashboard:
        return <DashboardPanel />;
      case Tab.GeminiTools:
        return (
          <div className="flex flex-col md:flex-row h-full">
            <aside className="w-full md:w-64 bg-gray-900/50 p-4 border-b md:border-b-0 md:border-r border-gray-700 overflow-y-auto">
              <h2 className="text-lg font-semibold text-cyan-400 mb-4">Tools</h2>
              <nav className="flex flex-row md:flex-col gap-2">
                {Object.values(Tool).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors w-full text-left ${
                      activeTool === tool ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-gray-700/50 text-gray-300'
                    }`}
                  >
                    {toolIcons[tool]}
                    <span className="hidden md:inline">{tool}</span>
                  </button>
                ))}
              </nav>
            </aside>
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-900 overflow-y-auto">
              {toolComponents[activeTool]}
            </main>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <header className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <BionetIcon />
          <h1 className="text-xl font-bold text-gray-100 tracking-wider">Bionet</h1>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4">
          {(Object.values(Tab)).map(tab => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                    activeTab === tab 
                    ? 'bg-cyan-500 text-gray-900 shadow-md' 
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                >
                {tab === Tab.Dashboard ? <DashboardIcon /> : <ToolsIcon />}
                <span>{tab}</span>
            </button>
          ))}
        </nav>
      </header>
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
