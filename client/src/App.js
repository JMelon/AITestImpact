import React, { useState } from 'react';
import TestCaseGenerator from './components/TestCaseGenerator';
import QualityAssessment from './components/QualityAssessment';
import TestCodeGenerator from './components/TestCodeGenerator';
import Navigation from './components/Navigation';

function App() {
  const [currentTool, setCurrentTool] = useState('testCaseGenerator');

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10 font-sans">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">AI-Powered Testing Tools Platform</h1>
        <p className="text-lg text-gray-300">Generate test cases, assess quality practices, and improve your testing workflows with AI</p>
        <Navigation currentTool={currentTool} setCurrentTool={setCurrentTool} />
      </header>
      <main>
        {currentTool === 'testCaseGenerator' && <TestCaseGenerator />}
        {currentTool === 'qualityAssessment' && <QualityAssessment />}
        {currentTool === 'testCodeGenerator' && <TestCodeGenerator />}
      </main>
      <footer className="text-center text-gray-400 mt-10 pt-6 border-t border-gray-800">
        <p>Created for NTD 2025 Tutorial</p>
      </footer>
    </div>
  );
}

export default App;
