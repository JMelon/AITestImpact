import React from 'react';
import './Navigation.css';

const Navigation = ({ currentTool, setCurrentTool }) => {
  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <button
          className={`nav-button ${currentTool === 'testCaseGenerator' ? 'active' : ''}`}
          onClick={() => setCurrentTool('testCaseGenerator')}
        >
          Test Case Generator
        </button>
        <button
          className={`nav-button ${currentTool === 'qualityAssessment' ? 'active' : ''}`}
          onClick={() => setCurrentTool('qualityAssessment')}
        >
          Quality Assessment
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
