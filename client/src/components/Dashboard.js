import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ setActiveComponent }) => {
  // Add state for real statistics data
  const [systemStats, setSystemStats] = useState({
    totalTestCases: 0,
    passedTests: 0,
    failedTests: 0,
    generationCount: 0,
    loading: true,
    error: null,
    errorDetails: null
  });

  // Fetch real system statistics when component mounts
  const fetchSystemStatistics = async () => {
    setSystemStats(prev => ({ ...prev, loading: true, error: null, errorDetails: null }));
    
    try {
      // Fetch test case statistics from the API
      const response = await axios.get('http://localhost:5000/api/test-cases/stats');
      
      if (response.data) {
        setSystemStats({
          totalTestCases: response.data.totalCount || 0,
          passedTests: response.data.passedCount || 0,
          failedTests: response.data.failedCount || 0,
          generationCount: response.data.generationCount || 0,
          loading: false,
          error: null,
          errorDetails: null
        });
      }
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      
      // Extract more specific error information
      const errorMessage = 'Unable to load statistics. Using placeholder data.';
      const errorDetails = error.response 
        ? `Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}` 
        : error.message || 'Unknown error';
      
      console.log('Error details:', errorDetails);
      
      // Set default values when error occurs
      setSystemStats({
        totalTestCases: 0,
        passedTests: 0,
        failedTests: 0,
        generationCount: 0,
        loading: false,
        error: errorMessage,
        errorDetails: errorDetails
      });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSystemStatistics();
  }, []);

  // Calculate the pass rate percentage
  const passRate = systemStats.totalTestCases > 0 
    ? Math.round((systemStats.passedTests / systemStats.totalTestCases) * 100) 
    : 0;

  // Replace the Recent Activity section with real data
  const renderSystemStatistics = () => (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">System Statistics</h3>
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-2">
            {systemStats.error ? 'Using placeholder data' : `Last updated: ${new Date().toLocaleTimeString()}`}
          </span>
          <button 
            onClick={fetchSystemStatistics} 
            className="p-1.5 rounded-full bg-blue-900/50 hover:bg-blue-800/70 text-blue-300 transition-colors"
            title="Refresh statistics"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {systemStats.loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : systemStats.error ? (
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg">
          <p className="font-medium">{systemStats.error}</p>
          {systemStats.errorDetails && (
            <div className="mt-2">
              <p className="text-sm text-red-300 font-medium">Error Details:</p>
              <div className="mt-1 p-2 bg-red-950/50 rounded text-xs font-mono overflow-x-auto">
                {systemStats.errorDetails}
              </div>
            </div>
          )}
          <button 
            onClick={fetchSystemStatistics}
            className="mt-3 px-3 py-1.5 bg-red-800/50 hover:bg-red-700/50 rounded-md text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-900/60 p-5 rounded-xl">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-lg font-semibold text-white">Test Case Inventory</span>
            </div>
            <div className="bg-gray-800/70 p-3 rounded-lg">
              <h4 className="text-white font-medium text-xl">{systemStats.totalTestCases}</h4>
              <p className="text-gray-300 text-sm">Total test cases in the system</p>
            </div>
          </div>
          
          <div className="bg-gray-900/60 p-5 rounded-xl">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-semibold text-white">Test Pass Rate</span>
            </div>
            <div className="bg-gray-800/70 p-3 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-white font-medium">{passRate}%</span>
                <span className="text-sm text-gray-400">
                  {systemStats.passedTests} passed / {systemStats.failedTests} failed
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${passRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* MVP Introduction and Disclaimer */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">Welcome to AITestImpact</h2>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300">
            AITestImpact is an AI-powered platform designed to revolutionize your software testing process by automatically generating test cases, analyzing requirements, and providing testing insights.
          </p>
          
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 my-4">
            <h3 className="text-amber-400 text-lg font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Important Disclaimer - MVP Version
            </h3>
            <p className="mt-2">
              This is a <strong>Minimum Viable Product (MVP)</strong> version of AITestImpact. The platform is still under active development and may contain bugs, inconsistencies, or produce unexpected results.
            </p>
            <p className="mt-2">
              <strong>Use at your own risk.</strong> The AI-generated content should be reviewed by professionals before being used in production environments. We do not guarantee the accuracy, completeness, or reliability of the generated test cases and other outputs.
            </p>
          </div>
          
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 my-4">
            <h3 className="text-red-400 text-lg font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Security Notice
            </h3>
            <p className="mt-2">
              This application has not undergone security testing. It's built for demonstration purposes only and lacks standard security validations.
            </p>
            <p className="mt-2">
              Please use with non-sensitive data in isolated test environments only.
            </p>
          </div>
          
          <p>
            This platform provides several AI-powered tools to assist with different aspects of your testing process:
          </p>
          
          <ul className="mt-2">
            <li>Generate comprehensive test cases from requirements, UI screenshots, or API specs</li>
            <li>Analyze test coverage to identify gaps in your testing</li>
            <li>Generate test automation code from your test cases</li>
            <li>Review requirements for potential issues and improvements</li>
            <li>Manage and organize your test cases</li>
          </ul>
          
          <p className="mt-4">
            To get started, select one of the tools from the navigation bar above or explore the features below.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-xl border border-blue-800/50 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => setActiveComponent('testCaseGenerator')}
        >
          <div className="h-12 w-12 bg-blue-700/30 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Test Case Generator</h3>
          <p className="text-gray-300">Generate comprehensive test cases from requirements, UI screenshots, or API specs.</p>
        </div>

        <div 
          className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl border border-purple-800/50 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => setActiveComponent('testCoverageAnalyzer')}
        >
          <div className="h-12 w-12 bg-purple-700/30 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Coverage Analyzer</h3>
          <p className="text-gray-300">Analyze test coverage against requirements to identify gaps and improve quality.</p>
        </div>

        <div 
          className="bg-gradient-to-br from-indigo-900/50 to-green-900/50 rounded-xl border border-indigo-800/50 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => setActiveComponent('testCodeGenerator')}
        >
          <div className="h-12 w-12 bg-indigo-700/30 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Test Code Generator</h3>
          <p className="text-gray-300">Convert test cases into executable test automation code across frameworks.</p>
        </div>
        
        <div 
          className="bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-xl border border-green-800/50 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => setActiveComponent('requirementReview')}
        >
          <div className="h-12 w-12 bg-green-700/30 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Requirement Review</h3>
          <p className="text-gray-300">Analyze requirements for issues, ambiguities, and edge cases before creating test cases.</p>
        </div>

        <div 
          className="bg-gradient-to-br from-teal-900/50 to-cyan-900/50 rounded-xl border border-teal-800/50 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => setActiveComponent('testCaseManager')}
        >
          <div className="h-12 w-12 bg-teal-700/30 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Test Case Manager</h3>
          <p className="text-gray-300">Organize, track, and manage test cases throughout the testing lifecycle.</p>
        </div>
        
        <div 
          className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-xl border border-cyan-800/50 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => setActiveComponent('documentation')}
        >
          <div className="h-12 w-12 bg-cyan-700/30 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-white">Documentation</h3>
          <p className="text-gray-300">Learn how to use all features and get the most out of the platform.</p>
        </div>
      </div>

      {/* System Statistics and Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSystemStatistics()}

        {/* Quick Tips Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Quick Tips</h3>
          <div className="space-y-4">
            <div className="bg-gray-900/60 p-4 rounded-xl flex items-start">
              <div className="bg-purple-900/70 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium">Multi-Image Analysis</h4>
                <p className="text-gray-300 text-sm mt-1">Upload multiple screenshots for comprehensive multi-step workflow tests.</p>
              </div>
            </div>
            
            <div className="bg-gray-900/60 p-4 rounded-xl flex items-start">
              <div className="bg-blue-900/70 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium">Use Refinement Iterations</h4>
                <p className="text-gray-300 text-sm mt-1">Set refinement iterations to 2-3 for more comprehensive test cases.</p>
              </div>
            </div>
            
            <div className="bg-gray-900/60 p-4 rounded-xl flex items-start">
              <div className="bg-green-900/70 p-2 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium">Generated Code Customization</h4>
                <p className="text-gray-300 text-sm mt-1">Always update element selectors in generated code before using in your project.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
