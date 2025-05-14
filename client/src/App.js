import React, { useState } from 'react';
import './App.css';
import TestCaseGenerator from './components/TestCaseGenerator';
import QualityAssessment from './components/QualityAssessment';
import Navigation from './components/Navigation';

function App() {
  const [currentTool, setCurrentTool] = useState('testCaseGenerator');

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Powered Testing Tools Platform</h1>
        <Navigation currentTool={currentTool} setCurrentTool={setCurrentTool} />
      </header>
      <main>
        {currentTool === 'testCaseGenerator' && <TestCaseGenerator />}
        {currentTool === 'qualityAssessment' && <QualityAssessment />}
      </main>
      <footer>
        <p>Created for NTD 2025 Tutorial</p>
      </footer>
    </div>
  );
}

export default App;
