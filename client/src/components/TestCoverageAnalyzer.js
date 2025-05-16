import React, { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import ApiKeyCheck from './common/ApiKeyCheck';
import { processImageFiles, clearAllImages, removeImage } from '../utils/imageUtils';
import { useToken } from '../context/TokenContext';

const TestCoverageAnalyzer = ({ setActiveComponent }) => {
  const [requirements, setRequirements] = useState('');
  const [testCases, setTestCases] = useState('');
  const [inputType, setInputType] = useState('text'); // 'text', 'image', 'swagger'
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [, setImageFiles] = useState([]); // Fix unused variable warning
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverageResults, setCoverageResults] = useState(null);
  const fileInputRef = useRef(null);
  const tokenContext = useToken();
  const apiToken = tokenContext ? tokenContext.apiToken : null;
  const modelName = tokenContext ? tokenContext.modelName : 'gpt-4.1-2025-04-14';

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      processImageFiles(
        files, 
        setImageFiles, 
        setImagePreviews, 
        setError
      );
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(
        Array.from(e.dataTransfer.files),
        setImageFiles,
        setImagePreviews,
        setError
      );
    }
  };

  const handleClearAllImages = () => {
    clearAllImages(setImageFiles, setImagePreviews, fileInputRef);
  };

  const handleRemoveImage = (index) => {
    removeImage(index, setImageFiles, setImagePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCoverageResults(null);

    try {
      // Validate inputs based on input type
      if (inputType === 'text' && (!requirements || !testCases)) {
        throw new Error('Both requirements and test cases are required');
      } else if (inputType === 'image' && imagePreviews.length === 0) {
        throw new Error('Please upload at least one image');
      } else if (inputType === 'swagger' && !swaggerUrl) {
        throw new Error('Swagger URL is required');
      }

      let requestData = {
        testCases,
        inputType
      };

      // Add input-type specific data
      if (inputType === 'text') {
        requestData.requirements = requirements;
      } else if (inputType === 'image') {
        requestData.imageDataArray = imagePreviews;
      } else if (inputType === 'swagger') {
        requestData.swaggerUrl = swaggerUrl;
      }

      const headers = {};
      if (apiToken) {
        headers['X-OpenAI-Token'] = apiToken;
        headers['X-OpenAI-Model'] = modelName; // Add model name to headers
      }

      const response = await axios.post('http://localhost:5000/api/analyze-test-coverage', requestData, { headers });
      setCoverageResults(response.data);
    } catch (err) {
      setError(
        err.response?.data?.details || 
        err.response?.data?.error || 
        err.message ||
        'Failed to analyze test coverage. Please try again.'
      );
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (inputType === 'text') return !requirements || !testCases;
    if (inputType === 'image') return imagePreviews.length === 0 || !testCases;
    if (inputType === 'swagger') return !swaggerUrl || !testCases;
    return true;
  };

  const renderImageUploadSection = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">
          Upload Requirement Screenshots:
        </label>
        {imagePreviews.length > 0 && (
          <button
            type="button"
            onClick={handleClearAllImages}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Clear all
          </button>
        )}
      </div>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : imagePreviews.length > 0
              ? 'border-green-500 bg-green-500/10' 
              : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          ref={fileInputRef}
          multiple
        />
        
        {imagePreviews.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative" onClick={e => e.stopPropagation()}>
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`} 
                  className="max-h-[160px] mx-auto rounded-lg border border-gray-700"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="text-xs text-gray-400 mt-1 text-center">Image {index + 1}</div>
              </div>
            ))}
            <div 
              className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 h-[160px]"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="mt-1 text-sm text-gray-400">Add more</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-400">Drag and drop requirement images here, or click to select</p>
            <p className="mt-1 text-xs text-gray-500">(Max total size: 16MB)</p>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {imagePreviews.length > 0 ? `${imagePreviews.length} image(s) selected` : ''}
      </p>
    </div>
  );

  const renderCoverageChart = () => {
    if (!coverageResults || !coverageResults.coverageScore) return null;
    
    const score = coverageResults.coverageScore;
    let colorClass;
    
    if (score >= 90) colorClass = "bg-green-500";
    else if (score >= 75) colorClass = "bg-blue-500";
    else if (score >= 50) colorClass = "bg-yellow-500";
    else colorClass = "bg-red-500";
    
    return (
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Coverage Score: {score}%</span>
          <span className="text-sm">
            {score >= 90 ? 'Excellent' : 
             score >= 75 ? 'Good' : 
             score >= 50 ? 'Moderate' : 
             'Poor'}
          </span>
        </div>
        <div className="h-4 bg-gray-700 rounded-full">
          <div 
            className={`h-4 rounded-full ${colorClass}`} 
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <ApiKeyCheck setActiveComponent={setActiveComponent} />
      
      {/* Left Panel - Inputs */}
      <div className="w-full md:w-1/2 bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Test Coverage Analyzer</h3>
        
        <div className="flex mb-6 bg-gray-800 p-1 rounded-lg overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              inputType === 'text' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => handleInputTypeChange('text')}
          >
            Text Requirements
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              inputType === 'image' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => handleInputTypeChange('image')}
          >
            Image Requirements
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              inputType === 'swagger' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => handleInputTypeChange('swagger')}
          >
            Swagger API
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Requirements input based on type */}
          {inputType === 'text' ? (
            <div className="mb-6">
              <label htmlFor="requirements" className="block text-sm font-medium mb-2">
                Requirements/Acceptance Criteria:
              </label>
              <textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Enter the requirements or acceptance criteria..."
                className="w-full min-h-[150px] bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required={inputType === 'text'}
              ></textarea>
              <button
                type="button"
                onClick={() => setRequirements("As a user, I want to be able to reset my password so that I can regain access to my account if I forget my credentials.")}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Fill with example
              </button>
            </div>
          ) : inputType === 'image' ? (
            renderImageUploadSection()
          ) : (
            <div className="mb-6">
              <label htmlFor="swaggerUrl" className="block text-sm font-medium mb-2">
                Swagger/OpenAPI JSON URL:
              </label>
              <input
                id="swaggerUrl"
                type="url"
                value={swaggerUrl}
                onChange={(e) => setSwaggerUrl(e.target.value)}
                placeholder="Enter the Swagger/OpenAPI JSON URL here..."
                className="w-full bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required={inputType === 'swagger'}
              />
              <p className="mt-2 text-xs text-gray-400">
                Example: https://petstore.swagger.io/v2/swagger.json
              </p>
            </div>
          )}

          {/* Test Cases Input */}
          <div className="mb-6">
            <label htmlFor="testCases" className="block text-sm font-medium mb-2">
              Test Cases:
            </label>
            <textarea
              id="testCases"
              value={testCases}
              onChange={(e) => setTestCases(e.target.value)}
              placeholder="Enter your test cases here (can be in any format: procedural, Gherkin, etc.)..."
              className="w-full min-h-[200px] bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            ></textarea>
            <button
              type="button"
              onClick={() => setTestCases(`Test Case 1: Successful Password Reset
1. Navigate to login page
2. Click on "Forgot Password" link
3. Enter registered email
4. Submit the form
5. Check email for reset link
6. Click on reset link
7. Enter new password
8. Confirm new password
9. Submit the form
Expected Result: User's password is reset and user can login with new password

Test Case 2: Invalid Email for Password Reset
1. Navigate to login page
2. Click on "Forgot Password" link
3. Enter unregistered email
4. Submit the form
Expected Result: System should display an error message indicating the email is not registered`)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Fill with example
            </button>
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            className={`w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors ${
              isSubmitDisabled() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitDisabled()}
          >
            {loading ? 'Analyzing Coverage...' : 'Analyze Test Coverage'}
          </button>
        </form>
      </div>

      {/* Right Panel - Results */}
      <div className="w-full md:w-1/2 bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Coverage Analysis Results</h3>
        
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-pulse">Analyzing test coverage, please wait...</div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {coverageResults && (
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
            {renderCoverageChart()}
            
            {/* Missing Areas Section */}
            {coverageResults.missingAreas && coverageResults.missingAreas.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3 text-red-400">Missing Coverage Areas:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {coverageResults.missingAreas.map((area, index) => (
                    <li key={index} className="text-red-300">
                      <span className="font-medium">{area.description}</span>
                      {area.importance && (
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                          area.importance === 'high' ? 'bg-red-900 text-red-200' :
                          area.importance === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-blue-900 text-blue-200'
                        }`}>
                          {area.importance.toUpperCase()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Coverage Details Section */}
            {coverageResults.coverageDetails && coverageResults.coverageDetails.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3">Coverage Details:</h4>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Requirement Area
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Covered By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {coverageResults.coverageDetails.map((detail, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                          <td className="px-4 py-3 text-sm">
                            {detail.area}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              detail.covered ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                            }`}>
                              {detail.covered ? 'Covered' : 'Not Covered'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {detail.testCases && detail.testCases.length > 0 ? (
                              <ul className="list-disc pl-5">
                                {detail.testCases.map((tc, idx) => (
                                  <li key={idx}>{tc}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Suggestions Section */}
            {coverageResults.suggestions && coverageResults.suggestions.length > 0 && (
              <div>
                <h4 className="text-lg font-medium mb-3 text-blue-400">Suggested Improvements:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {coverageResults.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-blue-300">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Full Analysis Section */}
            {coverageResults.analysis && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-lg font-medium mb-3">Detailed Analysis:</h4>
                <div className="prose prose-invert prose-sm max-w-none">
                  {/* FIX: Only render ReactMarkdown if analysis is a string */}
                  {typeof coverageResults.analysis === 'string' ? (
                    <ReactMarkdown components={{ code: CodeBlock }}>
                      {coverageResults.analysis}
                    </ReactMarkdown>
                  ) : (
                    <pre className="text-red-400 bg-gray-900 p-2 rounded">
                      {JSON.stringify(coverageResults.analysis, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCoverageAnalyzer;
