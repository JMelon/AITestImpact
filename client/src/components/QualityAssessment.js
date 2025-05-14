import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './QualityAssessment.css';

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
    <div className="quality-assessment">
      <div className="assessment-container">
        <div className="checkbox-section">
          <h3>Select Quality Practices in Your Project</h3>
          <p>Check all the practices, technologies, and tools that apply to your project:</p>
          
          <form onSubmit={handleSubmit}>
            {Object.entries(categories).map(([category, practices]) => (
              <div key={category} className="category-section">
                <div className="category-header">
                  <h4>{category}</h4>
                  <button 
                    type="button" 
                    className="toggle-button"
                    onClick={() => selectAllInCategory(category)}
                  >
                    Toggle All
                  </button>
                </div>
                <div className="practices-grid">
                  {practices.map(practice => (
                    <div key={practice} className="practice-checkbox">
                      <input
                        type="checkbox"
                        id={practice.replace(/\s/g, '-')}
                        checked={selectedPractices.includes(practice)}
                        onChange={() => handleCheckboxChange(practice)}
                      />
                      <label htmlFor={practice.replace(/\s/g, '-')}>
                        {practice}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="controls">
              <div className="selection-info">
                Selected {selectedPractices.length} of {allPractices.length} practices
              </div>
              <button 
                type="submit" 
                className="generate-btn"
                disabled={loading || selectedPractices.length === 0}
              >
                {loading ? 'Generating...' : 'Generate Quality Assessment'}
              </button>
            </div>
          </form>
        </div>

        <div className="result-section">
          <h3>Quality Assessment</h3>
          {loading && <div className="loading">Generating quality assessment, please wait...</div>}
          {error && <div className="error">{error}</div>}
          <div className="result-content">
            {result && <ReactMarkdown>{result}</ReactMarkdown>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityAssessment;
