import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const QualityAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [selectedPractices, setSelectedPractices] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await axios.post('/api/generate-quality-assessment', {
        selectedPractices
      });
      setResult(res.data.choices[0].message.content);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Select Quality Practices</h3>
        <form onSubmit={handleSubmit} className="overflow-auto max-h-[70vh]">
          {Object.entries(categories).map(([category, practices]) => (
            <div key={category} className="mb-4 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                <h4 className="font-medium">{category}</h4>
                <button 
                  type="button" 
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                  onClick={() => selectAllInCategory(category)}
                >
                  Toggle All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {practices.map(practice => (
                  <div key={practice} className="flex items-center">
                    <input
                      type="checkbox"
                      id={practice.replace(/\s/g, '-')}
                      checked={selectedPractices.includes(practice)}
                      onChange={() => handleCheckboxChange(practice)}
                      className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                    />
                    <label htmlFor={practice.replace(/\s/g, '-')} className="text-sm">
                      {practice}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="sticky bottom-0 pt-4 pb-2 bg-gray-900">
            <div className="flex flex-col gap-3">
              <div className="text-sm text-gray-400 text-center">
                Selected {selectedPractices.length} of {allPractices.length} practices
              </div>
              <button 
                type="submit" 
                className={`w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors ${
                  loading || selectedPractices.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading || selectedPractices.length === 0}
              >
                {loading ? 'Generating...' : 'Generate Quality Assessment'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Quality Assessment</h3>
        {loading && (
          <div className="flex items-center justify-center h-56 text-gray-400">
            <div className="animate-pulse">Generating quality assessment, please wait...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="h-[60vh] overflow-auto bg-gray-800 border border-gray-700 p-4 rounded-lg">
          {result && (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityAssessment;
