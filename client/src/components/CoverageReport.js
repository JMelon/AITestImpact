import React from 'react';

const CoverageReport = ({ coverageData, onRequestImprovement }) => {
  if (!coverageData) return null;
  
  const { coverageScore, missingAreas, needsAiAnalysis } = coverageData;
  
  // Determine coverage level and styling
  const getCoverageLevel = (score) => {
    if (score === null) return { text: 'Unknown', color: 'gray' };
    if (score >= 90) return { text: 'Excellent', color: 'green' };
    if (score >= 75) return { text: 'Good', color: 'blue' };
    if (score >= 50) return { text: 'Moderate', color: 'yellow' };
    return { text: 'Poor', color: 'red' };
  };
  
  const coverageLevel = getCoverageLevel(coverageScore);
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-medium mb-2 flex justify-between items-center">
        <span>Test Coverage Analysis</span>
        {coverageScore !== null && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            coverageLevel.color === 'green' ? 'bg-green-900 text-green-200' :
            coverageLevel.color === 'blue' ? 'bg-blue-900 text-blue-200' :
            coverageLevel.color === 'yellow' ? 'bg-yellow-900 text-yellow-200' :
            coverageLevel.color === 'red' ? 'bg-red-900 text-red-200' :
            'bg-gray-700 text-gray-200'
          }`}>
            {coverageScore}% - {coverageLevel.text}
          </span>
        )}
      </h3>
      
      {needsAiAnalysis ? (
        <div className="bg-blue-900/30 border border-blue-800 rounded p-3 text-sm">
          <p>Detailed coverage analysis requires AI evaluation for this input type.</p>
          <button 
            onClick={onRequestImprovement}
            className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
          >
            Analyze with AI
          </button>
        </div>
      ) : (
        <>
          {coverageScore !== null && (
            <div className="mb-3">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    coverageLevel.color === 'green' ? 'bg-green-500' :
                    coverageLevel.color === 'blue' ? 'bg-blue-500' :
                    coverageLevel.color === 'yellow' ? 'bg-yellow-500' :
                    coverageLevel.color === 'red' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}
                  style={{ width: `${coverageScore}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {missingAreas && missingAreas.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Potential Missing Areas:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1 text-gray-400">
                {missingAreas.map((area, idx) => (
                  <li key={idx}>{area.term || area.description}</li>
                ))}
              </ul>
              
              <button 
                onClick={onRequestImprovement}
                className="mt-3 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
              >
                Generate Test Cases for Missing Areas
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CoverageReport;
