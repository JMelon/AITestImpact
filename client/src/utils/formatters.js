import React from 'react';

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'P0-Critical': return 'bg-red-600';
    case 'P1-High': return 'bg-orange-600';
    case 'P2-Medium': return 'bg-yellow-600';
    case 'P3-Low': return 'bg-blue-600';
    default: return 'bg-gray-600';
  }
};

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'Blocker': return 'bg-red-700';
    case 'Critical': return 'bg-red-600';
    case 'Major': return 'bg-orange-600';
    case 'Minor': return 'bg-yellow-600';
    default: return 'bg-gray-600';
  }
};

// Function to format Gherkin content with proper syntax highlighting
export const formatGherkinContent = (testCase) => {
  if (!testCase || !testCase.content) return null;
  
  // For structured Gherkin data from the API
  if (testCase.structuredData && testCase.structuredData.gherkin) {
    const gherkin = testCase.structuredData.gherkin;
    
    return (
      <div className="font-mono text-sm whitespace-pre-wrap bg-gray-900 p-3 rounded-md overflow-auto">
        {/* Feature section */}
        {gherkin.tags && (
          <div className="text-blue-400 mb-2">
            {gherkin.tags.map((tag, idx) => (
              <span key={idx}>@{tag} </span>
            ))}
          </div>
        )}
        
        <div className="text-purple-400 font-semibold mb-2">
          Feature: {gherkin.feature || testCase.title}
        </div>
        
        {/* Background section if available */}
        {gherkin.background && (
          <div className="mb-4">
            <div className="text-cyan-400 font-medium">Background:</div>
            <div className="pl-4 text-gray-300">{gherkin.background}</div>
          </div>
        )}
        
        {/* Scenario section */}
        <div className="text-blue-400 font-medium mb-2">
          {gherkin.scenarioType || 'Scenario'}: {gherkin.scenario || testCase.title}
        </div>
        
        {/* Given steps */}
        {gherkin.givenSteps && gherkin.givenSteps.map((step, idx) => (
          <div key={`given-${idx}`} className="pl-4 mb-1">
            <span className="text-green-400 font-medium">Given </span>
            <span className="text-gray-200">{step}</span>
          </div>
        ))}
        
        {/* When steps */}
        {gherkin.whenSteps && gherkin.whenSteps.map((step, idx) => (
          <div key={`when-${idx}`} className="pl-4 mb-1">
            <span className="text-yellow-400 font-medium">When </span>
            <span className="text-gray-200">{step}</span>
          </div>
        ))}
        
        {/* Then steps */}
        {gherkin.thenSteps && gherkin.thenSteps.map((step, idx) => (
          <div key={`then-${idx}`} className="pl-4 mb-1">
            <span className="text-pink-400 font-medium">Then </span>
            <span className="text-gray-200">{step}</span>
          </div>
        ))}
        
        {/* And/But steps would go here if they were separated in the API */}
        
        {/* Examples section if available */}
        {gherkin.examples && (
          <div className="mt-4">
            <div className="text-gray-400 font-medium">Examples:</div>
            <div className="pl-4 overflow-x-auto">
              <pre className="text-gray-300">{gherkin.examples}</pre>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // For raw, unstructured Gherkin text content
  // Parse and highlight the raw text with regex
  const gherkinContent = testCase.content;
  
  // Process the content line by line for better control
  const lines = gherkinContent.split('\n');
  
  const formattedLines = lines.map((line, idx) => {
    // Match different Gherkin keywords and apply appropriate styling
    if (line.trim().startsWith('@')) {
      // Tags
      return <div key={idx} className="text-blue-400">{line}</div>;
    } else if (line.trim().startsWith('Feature:')) {
      // Feature
      return <div key={idx} className="text-purple-400 font-semibold">{line}</div>;
    } else if (line.trim().startsWith('Background:')) {
      // Background
      return <div key={idx} className="text-cyan-400 font-medium">{line}</div>;
    } else if (line.trim().startsWith('Scenario:') || line.trim().startsWith('Scenario Outline:')) {
      // Scenario or Scenario Outline
      return <div key={idx} className="text-blue-400 font-medium">{line}</div>;
    } else if (line.trim().startsWith('Given ')) {
      // Given steps
      return (
        <div key={idx} className="pl-4">
          <span className="text-green-400 font-medium">Given </span>
          <span className="text-gray-200">{line.replace('Given ', '')}</span>
        </div>
      );
    } else if (line.trim().startsWith('When ')) {
      // When steps
      return (
        <div key={idx} className="pl-4">
          <span className="text-yellow-400 font-medium">When </span>
          <span className="text-gray-200">{line.replace('When ', '')}</span>
        </div>
      );
    } else if (line.trim().startsWith('Then ')) {
      // Then steps
      return (
        <div key={idx} className="pl-4">
          <span className="text-pink-400 font-medium">Then </span>
          <span className="text-gray-200">{line.replace('Then ', '')}</span>
        </div>
      );
    } else if (line.trim().startsWith('And ')) {
      // And steps
      return (
        <div key={idx} className="pl-4">
          <span className="text-gray-400 font-medium">And </span>
          <span className="text-gray-200">{line.replace('And ', '')}</span>
        </div>
      );
    } else if (line.trim().startsWith('But ')) {
      // But steps
      return (
        <div key={idx} className="pl-4">
          <span className="text-gray-400 font-medium">But </span>
          <span className="text-gray-200">{line.replace('But ', '')}</span>
        </div>
      );
    } else if (line.trim().startsWith('Examples:')) {
      // Examples heading
      return <div key={idx} className="text-gray-400 font-medium">{line}</div>;
    } else if (line.trim().startsWith('|')) {
      // Table rows (in Examples or elsewhere)
      return <div key={idx} className="pl-4 text-gray-300 font-mono">{line}</div>;
    } else {
      // Any other lines
      return <div key={idx} className="text-gray-300">{line}</div>;
    }
  });
  
  return (
    <div className="font-mono text-sm whitespace-pre-wrap bg-gray-900 p-3 rounded-md overflow-auto">
      {formattedLines}
    </div>
  );
};
