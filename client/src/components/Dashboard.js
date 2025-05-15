import React from 'react';

const Dashboard = ({ setActiveComponent }) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <span className="text-xs text-gray-400">Created during Nordic Testing Days 2025 - Tutorial: Building an AI-Powered Testing Tools Platform</span>
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

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Recent Activity</h3>
          <div className="space-y-4">
            <div className="bg-gray-900/60 p-5 rounded-xl">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-semibold text-white">Test Case Generated</span>
              </div>
              <div className="bg-gray-800/70 p-3 rounded-lg">
                <span className="text-gray-400">Test Case ID: TC-001</span>
                <h4 className="text-white font-medium">User Login with Valid Credentials</h4>
                <p className="text-gray-300 text-sm mt-1">Generated 2 hours ago</p>
              </div>
            </div>
            
            <div className="bg-gray-900/60 p-5 rounded-xl">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-lg font-semibold text-white">Coverage Analysis</span>
              </div>
              <div className="bg-gray-800/70 p-3 rounded-lg">
                <span className="text-green-400 font-medium">85% Coverage</span>
                <h4 className="text-white font-medium">Login Feature Test Suite</h4>
                <p className="text-gray-300 text-sm mt-1">Analyzed 3 hours ago</p>
              </div>
            </div>
          </div>
        </div>

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
