
import React from 'react';
import ChatPanel from './ChatPanel';

const DashboardPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 p-4 sm:p-6 lg:p-8 bg-gray-900 text-gray-200">
      <div className="lg:w-1/2 flex flex-col justify-center">
        <div className="bg-gray-800/50 p-8 rounded-2xl shadow-xl border border-gray-700">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-cyan-400">
            Welcome to Bionet
            </h1>
            <p className="text-lg text-gray-300 mb-6">
            A decentralized global system for inventory tracking and exchange of physical biomaterials, powered by cutting-edge AI.
            </p>
            <p className="text-gray-400">
            Bionet is an offline-first web app utilizing Merkle-DAG data replication, think Git but for versionable, schemaless databases. Use the tools to analyze data, generate content, and interact with your digital lab assistant.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-cyan-300 mb-2">Inventory Tracking</h3>
                    <p className="text-gray-400">Create, edit, and search items and their locations seamlessly.</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-cyan-300 mb-2">Permission System</h3>
                    <p className="text-gray-400">Grant read/write/admin access to your projects with granular control.</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-cyan-300 mb-2">Versioned Sharing</h3>
                    <p className="text-gray-400">Share data with automatic change tracking and full history.</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-cyan-300 mb-2">Open Source</h3>
                    <p className="text-gray-400">Built on Node.js and modern web tech, fully open and extensible.</p>
                </div>
            </div>
        </div>
      </div>
      <div className="lg:w-1/2 h-full flex flex-col">
        <ChatPanel isEmbedded={true} />
      </div>
    </div>
  );
};

export default DashboardPanel;
