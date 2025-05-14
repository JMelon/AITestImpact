import React from 'react';

const Navigation = ({ currentTool, setCurrentTool }) => {
  return (
    <nav className="mt-4">
      <div className="flex bg-gray-800 rounded-xl overflow-hidden">
        <button
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
            currentTool === 'testCaseGenerator' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => setCurrentTool('testCaseGenerator')}
        >
          <span>Test Case Generator</span>
        </button>
        <button
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
            currentTool === 'qualityAssessment' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          onClick={() => setCurrentTool('qualityAssessment')}
        >
          <span>Quality Assessment</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
