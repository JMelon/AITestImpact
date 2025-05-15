import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToken } from '../context/TokenContext'; // Import useToken hook

// Custom renderer for code blocks in Markdown
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={match[1]}
      PreTag="div"
      customStyle={{ 
        margin: '1rem 0', 
        borderRadius: '0.375rem' 
      }}
      showLineNumbers={true}
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className ? `${className} bg-gray-800 px-1 rounded` : 'bg-gray-800 px-1 rounded'} {...props}>
      {children}
    </code>
  );
};

const QualityAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [selectedPractices, setSelectedPractices] = useState([]);

  const { apiToken, modelName } = useToken(); // Get both API token and model name

  const allPractices = [
    "Unit tests", "Integration tests", "Contract tests", "End-to-end tests", 
    "Exploratory testing", "Automated regression tests", "Load testing", 
    "Stress testing", "Performance testing", "Security testing", 
    "Static code analysis", "Dynamic code analysis", "Code reviews", 
    "Pair programming", "TDD (Test-Driven Development)", 
    "BDD (Behavior-Driven Development)", "CI (Continuous Integration)", 
    "CD (Continuous Delivery)", "Quality gates in pipelines", "Linting tools", 
    "Code coverage tracking", "Feature flags", "Monitoring in production", 
    "Observability tools", "Logging strategy", "Alerting strategy", 
    "Rollback strategy", "Canary releases", "Blue/Green deployments", 
    "Infrastructure as Code", "Containerization (e.g., Docker)", 
    "Orchestration (e.g., Kubernetes)", "Automated test environments", 
    "Synthetic testing", "Chaos engineering", "Risk-based testing", 
    "Flaky test management", "Test data management", "Accessibility testing", 
    "Cross-browser testing", "Mobile testing", "Quality coaching", 
    "QA in planning/refinement sessions", "Shift-left testing", 
    "Shift-right testing", "Bug tracking system", "Root cause analysis practices", 
    "Definition of Done includes quality criteria", "Clean code practices", 
    "Technical debt management", "Security audits", 
    "Dependency vulnerability scanning", "Privacy by design", 
    "Ethical considerations in software", "Compliance testing", 
    "Documentation for testing strategies", "Test reporting dashboards", 
    "Test case versioning", "Manual test scripts maintained", 
    "Automated test reports", "Dedicated QA environments", 
    "Continuous testing strategy", "Quality KPIs tracked", 
    "Regression suite execution in pipelines", "AI-based test automation", 
    "Visual testing", "Smoke tests", "Sanity checks", 
    "Test tagging and filtering", "Test parallelization", 
    "Developer ownership of quality"
  ];

  // Categories for organizing practices
  const categories = {
    "Testing Approaches": [
      "Unit tests", "Integration tests", "Contract tests", "End-to-end tests",
      "Exploratory testing", "Automated regression tests", "TDD (Test-Driven Development)",
      "BDD (Behavior-Driven Development)", "Risk-based testing"
    ],
    "Performance & Security": [
      "Load testing", "Stress testing", "Performance testing", "Security testing",
      "Security audits", "Dependency vulnerability scanning", "Privacy by design"
    ],
    "Code Quality": [
      "Static code analysis", "Dynamic code analysis", "Code reviews",
      "Pair programming", "Linting tools", "Code coverage tracking",
      "Clean code practices", "Technical debt management"
    ],
    "CI/CD & Infrastructure": [
      "CI (Continuous Integration)", "CD (Continuous Delivery)",
      "Quality gates in pipelines", "Feature flags", "Rollback strategy",
      "Canary releases", "Blue/Green deployments", "Infrastructure as Code",
      "Containerization (e.g., Docker)", "Orchestration (e.g., Kubernetes)",
      "Automated test environments"
    ],
    "Monitoring & Observability": [
      "Monitoring in production", "Observability tools", "Logging strategy",
      "Alerting strategy", "Synthetic testing", "Chaos engineering"
    ],
    "Test Management": [
      "Flaky test management", "Test data management", "Test reporting dashboards",
      "Test case versioning", "Manual test scripts maintained", "Automated test reports",
      "Test tagging and filtering", "Test parallelization", "Smoke tests", "Sanity checks"
    ],
    "Quality Process": [
      "Quality coaching", "QA in planning/refinement sessions", "Shift-left testing",
      "Shift-right testing", "Bug tracking system", "Root cause analysis practices",
      "Definition of Done includes quality criteria", "Quality KPIs tracked",
      "Developer ownership of quality", "Continuous testing strategy"
    ],
    "Specialized Testing": [
      "Accessibility testing", "Cross-browser testing", "Mobile testing",
      "Compliance testing", "Ethical considerations in software",
      "Visual testing", "AI-based test automation"
    ],
    "Environment & Documentation": [
      "Dedicated QA environments", "Documentation for testing strategies",
      "Regression suite execution in pipelines"
    ]
  };

  const handleCheckboxChange = (practice) => {
    setSelectedPractices(prev => {
      if (prev.includes(practice)) {
        return prev.filter(p => p !== practice);
      } else {
        return [...prev, practice];
      }
    });
  };

  const selectAllInCategory = (category) => {
    const practicesInCategory = categories[category];
    
    // Check if all practices in this category are already selected
    const allSelected = practicesInCategory.every(practice => 
      selectedPractices.includes(practice)
    );
    
    if (allSelected) {
      // If all are selected, unselect them all
      setSelectedPractices(prev => 
        prev.filter(practice => !practicesInCategory.includes(practice))
      );
    } else {
      // Otherwise, select all in this category
      setSelectedPractices(prev => {
        const newSelections = [...prev];
        practicesInCategory.forEach(practice => {
          if (!newSelections.includes(practice)) {
            newSelections.push(practice);
          }
        });
        return newSelections;
      });
    }
  };

  const generateAssessment = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      if (selectedPractices.length === 0) {
        throw new Error('Please select at least one quality practice');
      }

      if (!apiToken) {
        throw new Error('OpenAI API key is required. Please configure it in the settings page.');
      }

      const response = await axios.post(
        'http://localhost:5000/api/generate-quality-assessment',
        { selectedPractices },
        {
          headers: {
            'X-OpenAI-Token': apiToken,
            'X-OpenAI-Model': modelName // Add model name to headers
          }
        }
      );

      setResult(response.data.choices[0].message.content);
    } catch (err) {
      setError(
        err.response?.data?.details || 
        err.response?.data?.error || 
        'Failed to generate quality assessment. Please try again.'
      );
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.round((selectedPractices.length / allPractices.length) * 100);

  return (
    <div className="flex flex-col gap-8">
      {/* Selection Panel - Always on top */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-2">Select Quality Practices</h3>
        
        {/* Progress bar and selection count */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-400">
              {selectedPractices.length} out of {allPractices.length} practices selected
            </span>
            <span className="text-sm font-medium text-gray-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Categories section */}
        <form onSubmit={(e) => { e.preventDefault(); generateAssessment(); }}>
          <div className="overflow-auto max-h-[40vh]">
            {Object.entries(categories).map(([category, practices]) => (
              <div key={category} className="mb-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                  <h4 className="font-medium">{category}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {practices.filter(p => selectedPractices.includes(p)).length}/{practices.length}
                    </span>
                    <button 
                      type="button" 
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                      onClick={() => selectAllInCategory(category)}
                    >
                      Toggle All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                  {practices.map(practice => (
                    <div 
                      key={practice} 
                      className={`flex items-center p-2 rounded transition-colors ${
                        selectedPractices.includes(practice) ? 'bg-gray-700/50' : 'hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={practice.replace(/\s/g, '-')}
                        checked={selectedPractices.includes(practice)}
                        onChange={() => handleCheckboxChange(practice)}
                        className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                      />
                      <label htmlFor={practice.replace(/\s/g, '-')} className="text-sm cursor-pointer">
                        {practice}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Generate button */}
          <div className="mt-4">
            <button 
              type="submit" 
              className={`w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors ${
                loading || selectedPractices.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading || selectedPractices.length === 0}
            >
              {loading ? 'Generating...' : 'Generate Quality Assessment'}
            </button>
          </div>
        </form>
      </div>

      {/* Output Panel - Always below */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Quality Assessment</h3>
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-pulse">Generating quality assessment, please wait...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="max-h-[50vh] overflow-auto bg-gray-800 border border-gray-700 p-4 rounded-lg">
          {result && (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code: CodeBlock
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityAssessment;
