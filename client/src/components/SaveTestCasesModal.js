import React from 'react';

const SaveTestCasesModal = ({ 
  showModal, 
  setShowModal, 
  parsedTestCases, 
  selectedTestCases, 
  toggleTestCase, 
  selectAllTestCases, 
  deselectAllTestCases, 
  saveSelectedTestCases, 
  saveInProgress, 
  saveMessage 
}) => {
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Save Test Cases</h3>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setShowModal(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">Select the test cases you want to save:</p>
            <div className="flex gap-2">
              <button
                className="text-sm text-blue-400 hover:text-blue-300"
                onClick={selectAllTestCases}
              >
                Select All
              </button>
              <button
                className="text-sm text-blue-400 hover:text-blue-300"
                onClick={deselectAllTestCases}
              >
                Deselect All
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto mb-4">
          {parsedTestCases.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No test cases found to save</p>
          ) : (
            <div className="space-y-3">
              {parsedTestCases.map((testCase) => (
                <div 
                  key={testCase.id} 
                  className="border border-gray-700 rounded-lg p-3 flex items-start gap-3"
                >
                  <input
                    type="checkbox"
                    id={`tc-${testCase.id}`}
                    checked={!!selectedTestCases[testCase.id]}
                    onChange={() => toggleTestCase(testCase.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`tc-${testCase.id}`} 
                      className="font-medium cursor-pointer hover:text-blue-300"
                    >
                      {testCase.title}
                    </label>
                    <div className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {testCase.content.substring(0, 200)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {saveMessage && (
          <div className={`p-3 rounded-lg mb-4 ${
            saveMessage.includes('Error') 
              ? 'bg-red-900/30 border border-red-800 text-red-200' 
              : 'bg-green-900/30 border border-green-800 text-green-200'
          }`}>
            {saveMessage}
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 ${
              saveInProgress ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={saveSelectedTestCases}
            disabled={saveInProgress}
          >
            {saveInProgress ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Selected Test Cases'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveTestCasesModal;
