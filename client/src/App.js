import React, { useState, useEffect } from 'react';
import TestCaseGenerator from './components/TestCaseGenerator';
import QualityAssessment from './components/QualityAssessment';
import TestCodeGenerator from './components/TestCodeGenerator';
import RequirementReview from './components/RequirementReview';
import TestCaseManager from './components/TestCaseManager';
import TestCoverageAnalyzer from './components/TestCoverageAnalyzer';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';
import SearchBar from './components/SearchBar';
import Footer from './components/Footer';
import { TokenProvider } from './context/TokenContext';
import './App.css';

function App() {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  
  // Close mobile menu when changing pages
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeComponent]);

  const handleSearchResultClick = (result) => {
    if (result.type === 'Test Case') {
      setActiveComponent('testCaseManager');
    } else if (result.type === 'Documentation') {
      setActiveComponent('documentation');
    }
  };

  return (
    <TokenProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white flex flex-col">
        {/* Header and Navigation */}
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Brand - Reduced min-width and made more responsive */}
              <div className="flex items-center min-w-[120px] sm:min-w-[150px] mr-2 sm:mr-4" onClick={() => setActiveComponent('dashboard')} role="button">
                <div className="flex-shrink-0 flex items-center">
                  <svg className="h-7 w-7 sm:h-8 sm:w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="ml-1 sm:ml-2 text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600 truncate">
                    AITestImpact
                  </span>
                </div>
              </div>
              
              {/* Desktop Navigation - Improved spacing and responsiveness */}
              <nav className="hidden md:flex space-x-1 lg:space-x-2 flex-1 justify-center overflow-x-auto">
                {[
                  { name: 'Home', id: 'dashboard' },
                  { name: 'Test Gen', id: 'testCaseGenerator' },
                  { name: 'Coverage', id: 'testCoverageAnalyzer' },
                  { name: 'Code Gen', id: 'testCodeGenerator' },
                  { name: 'Req Review', id: 'requirementReview' },
                  { name: 'Tests', id: 'testCaseManager' },
                  { name: 'Docs', id: 'documentation' }
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`px-2 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeComponent === item.id
                        ? 'bg-purple-700/30 text-purple-300 border border-purple-700/50'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    onClick={() => setActiveComponent(item.id)}
                  >
                    {item.name}
                  </button>
                ))}
              </nav>
              
              {/* Desktop Search and Settings - Made more adaptive */}
              <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
                <div className="w-36 lg:w-48 xl:w-64">
                  <SearchBar onResultClick={handleSearchResultClick} />
                </div>
                <button 
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  onClick={() => alert('Settings will be implemented in the next version')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <button
                  onClick={() => setSearchVisible(!searchVisible)}
                  className="p-1.5 mr-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Mobile Search Bar */}
            {searchVisible && (
              <div className="md:hidden p-2 pb-4">
                <SearchBar onResultClick={handleSearchResultClick} />
              </div>
            )}
          </div>
          
          {/* Mobile Menu - Updated with shorter names */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-slate-900 border-t border-slate-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {[
                  { name: 'Home', id: 'dashboard' },
                  { name: 'Test Gen', id: 'testCaseGenerator' },
                  { name: 'Coverage', id: 'testCoverageAnalyzer' },
                  { name: 'Code Gen', id: 'testCodeGenerator' },
                  { name: 'Req Review', id: 'requirementReview' },
                  { name: 'Tests', id: 'testCaseManager' },
                  { name: 'Docs', id: 'documentation' }
                ].map((item) => (
                  <button
                    key={item.id}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      activeComponent === item.id
                        ? 'bg-purple-700/30 text-purple-300 border border-purple-700/50'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    onClick={() => setActiveComponent(item.id)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeComponent === 'dashboard' && <Dashboard setActiveComponent={setActiveComponent} />}
          {activeComponent === 'testCaseGenerator' && <TestCaseGenerator />}
          {activeComponent === 'qualityAssessment' && <QualityAssessment />}
          {activeComponent === 'testCodeGenerator' && <TestCodeGenerator />}
          {activeComponent === 'requirementReview' && <RequirementReview />}
          {activeComponent === 'testCaseManager' && <TestCaseManager />}
          {activeComponent === 'testCoverageAnalyzer' && <TestCoverageAnalyzer />}
          {activeComponent === 'documentation' && <Documentation />}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </TokenProvider>
  );
}

export default App;
