import React from 'react';
import './App.css';
import TestCaseGenerator from './components/TestCaseGenerator';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Powered Testing Tools Platform</h1>
        <h2>Test Case Generator</h2>
      </header>
      <main>
        <TestCaseGenerator />
      </main>
      <footer>
        <p>Created for NTD 2025 Tutorial</p>
      </footer>
    </div>
  );
}

export default App;
