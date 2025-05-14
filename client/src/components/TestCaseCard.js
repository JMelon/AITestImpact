import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const TestCaseCard = ({ testCase }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Helper function to get color class based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0-Critical': return 'bg-red-600';
      case 'P1-High': return 'bg-orange-600';
      case 'P2-Medium': return 'bg-yellow-600';
      case 'P3-Low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  // Helper function to get color class based on severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Blocker': return 'bg-red-700';
      case 'Critical': return 'bg-red-600';
      case 'Major': return 'bg-orange-600';
      case 'Minor': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg mb-4 overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg mb-2">{testCase.title}</h3>
          <div className="flex space-x-2">
            {testCase.priority && (
              <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(testCase.priority)}`}>
                {testCase.priority}
              </span>
            )}
            {testCase.severity && (
              <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(testCase.severity)}`}>
                {testCase.severity}
              </span>
            )}
            {testCase.format && (
              <span className="bg-gray-700 px-2 py-1 text-xs rounded">
                {testCase.format}
              </span>
            )}
          </div>
        </div>
        
        {testCase.structuredData && testCase.format === 'Procedural' && (
          <div className="mt-2 text-sm text-gray-300">
            <p>{testCase.structuredData.objective}</p>
          </div>
        )}
        
        {testCase.tags && testCase.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {testCase.tags.map((tag, idx) => (
              <span key={idx} className="bg-gray-700 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-3 flex items-center text-gray-400 text-sm">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="ml-1">{expanded ? 'Hide details' : 'Show details'}</span>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-700 p-4">
          {testCase.format === 'Procedural' && testCase.structuredData && testCase.structuredData.procedural ? (
            // Procedural test case details
            <div className="space-y-4">
              {testCase.structuredData.preconditions && testCase.structuredData.preconditions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Preconditions:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {testCase.structuredData.preconditions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testCase.structuredData.steps && testCase.structuredData.steps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Steps:</h4>
                  <div className="bg-gray-900 rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="py-2 px-3 text-left w-12">#</th>
                          <th className="py-2 px-3 text-left">Step</th>
                          <th className="py-2 px-3 text-left">Expected Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testCase.structuredData.steps.map((step, idx) => (
                          <tr key={idx} className="border-t border-gray-800 hover:bg-gray-800/50">
                            <td className="py-2 px-3">{step.number || idx + 1}</td>
                            <td className="py-2 px-3">{step.description}</td>
                            <td className="py-2 px-3 text-green-400">{step.expectedResult}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {testCase.structuredData.postconditions && testCase.structuredData.postconditions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Postconditions:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {testCase.structuredData.postconditions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : testCase.format === 'Gherkin' && testCase.structuredData && testCase.structuredData.gherkin ? (
            // Gherkin test case details
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-1">Feature:</h4>
                <p className="text-sm bg-gray-900 p-2 rounded">{testCase.structuredData.feature}</p>
              </div>
              
              {testCase.structuredData.background && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Background:</h4>
                  <pre className="text-sm bg-gray-900 p-2 rounded overflow-x-auto">{testCase.structuredData.background}</pre>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-1">{testCase.structuredData.scenarioType || 'Scenario'}:</h4>
                <p className="text-sm">{testCase.title}</p>
              </div>
              
              {testCase.structuredData.givenSteps && testCase.structuredData.givenSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-green-500 mb-1">Given:</h4>
                  <ul className="space-y-1 text-sm">
                    {testCase.structuredData.givenSteps.map((step, idx) => (
                      <li key={idx} className="bg-gray-900 p-2 rounded">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testCase.structuredData.whenSteps && testCase.structuredData.whenSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-blue-500 mb-1">When:</h4>
                  <ul className="space-y-1 text-sm">
                    {testCase.structuredData.whenSteps.map((step, idx) => (
                      <li key={idx} className="bg-gray-900 p-2 rounded">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testCase.structuredData.thenSteps && testCase.structuredData.thenSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-purple-500 mb-1">Then:</h4>
                  <ul className="space-y-1 text-sm">
                    {testCase.structuredData.thenSteps.map((step, idx) => (
                      <li key={idx} className="bg-gray-900 p-2 rounded">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testCase.structuredData.examples && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Examples:</h4>
                  <pre className="text-sm bg-gray-900 p-2 rounded overflow-x-auto">{testCase.structuredData.examples}</pre>
                </div>
              )}
            </div>
          ) : (
            // Fallback to raw content if structured data is not available
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown components={{ code: CodeBlock }}>
                {testCase.content}
              </ReactMarkdown>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem('testCasesForAutomation', testCase.content);
                const buttons = document.querySelectorAll('button');
                const testCodeButton = Array.from(buttons).find(
                  (button) => button.textContent.includes('Test Code Generator')
                );
                if (testCodeButton) {
                  testCodeButton.click();
                }
              }}
            >
              Generate Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseCard;