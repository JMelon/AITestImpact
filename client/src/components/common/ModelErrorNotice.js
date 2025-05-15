import React from 'react';

/**
 * A component to display model-related errors with guidance
 */
const ModelErrorNotice = ({ error, onRetry, onGoToSettings }) => {
  // Extract error details
  const { title, message, suggestion, isModelError } = error;
  
  return (
    <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
      <div className="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h4 className="font-medium text-red-300">{title || 'AI Model Error'}</h4>
          <p className="mt-1">{message}</p>
          {suggestion && <p className="mt-2 text-red-300">{suggestion}</p>}
        </div>
      </div>
      
      <div className="mt-4 flex gap-3">
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-3 py-1.5 bg-red-800/50 hover:bg-red-700/50 rounded text-sm"
          >
            Try Again
          </button>
        )}
        
        {isModelError && onGoToSettings && (
          <button 
            onClick={onGoToSettings}
            className="px-3 py-1.5 bg-blue-800/50 hover:bg-blue-700/50 rounded text-sm"
          >
            Go to Settings
          </button>
        )}
      </div>
    </div>
  );
};

export default ModelErrorNotice;
