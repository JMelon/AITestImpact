import React, { useState } from 'react';
import TestCaseGenerator from './components/TestCaseGenerator';
import QualityAssessment from './components/QualityAssessment';
import TestCodeGenerator from './components/TestCodeGenerator';
// eslint-disable-next-line no-unused-vars
import Navigation from './components/Navigation';
import RequirementReview from './components/RequirementReview';
import TestCaseManager from './components/TestCaseManager';
import TestCoverageAnalyzer from './components/TestCoverageAnalyzer';

function App() {
  const [activeComponent, setActiveComponent] = useState('testCaseGenerator');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800">
        <h1 className="text-4xl font-bold text-center py-4">AI-Powered Testing Tools Platform</h1>
        <p className="text-lg text-gray-300 text-center">Generate test cases, assess quality practices, and improve your testing workflows with AI</p>
        <nav className="mx-auto flex max-w-7xl px-4 py-4">
          <div className="flex space-x-4">
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeComponent === 'testCaseGenerator'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setActiveComponent('testCaseGenerator')}
            >
              Test Case Generator
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeComponent === 'qualityAssessment'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setActiveComponent('qualityAssessment')}
            >
              Quality Assessment
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeComponent === 'testCodeGenerator'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setActiveComponent('testCodeGenerator')}
            >
              Test Code Generator
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeComponent === 'requirementReview'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setActiveComponent('requirementReview')}
            >
              Requirement Review
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeComponent === 'testCaseManager'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setActiveComponent('testCaseManager')}
            >
              Test Case Manager
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeComponent === 'testCoverageAnalyzer'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setActiveComponent('testCoverageAnalyzer')}
            >
              Coverage Analyzer
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeComponent === 'testCaseGenerator' && <TestCaseGenerator />}
        {activeComponent === 'qualityAssessment' && <QualityAssessment />}
        {activeComponent === 'testCodeGenerator' && <TestCodeGenerator />}
        {activeComponent === 'requirementReview' && <RequirementReview />}
        {activeComponent === 'testCaseManager' && <TestCaseManager />}
        {activeComponent === 'testCoverageAnalyzer' && <TestCoverageAnalyzer />}
      </main>

      <footer className="text-center text-gray-400 mt-10 pt-6 border-t border-gray-800">
        <p>Created for NTD 2025 Tutorial</p>
      </footer>
    </div>
  );
}

export default App;
