import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  generateProceduralMarkdown, 
  generateGherkinMarkdown, 
  processStructuredTestCases 
} from '../utils/testCaseProcessor';
import { 
  processImageFiles,
  clearAllImages,
  removeImage
} from '../utils/imageUtils';
import { analyzeCoverage } from '../utils/coverageAnalyzer';
import TestCaseCard from './TestCaseCard';
import CodeBlock from './CodeBlock';
import SaveTestCasesModal from './SaveTestCasesModal';
import CoverageReport from './CoverageReport';
import { useToken } from '../context/TokenContext';
import ApiKeyCheck from './common/ApiKeyCheck';

const TestCaseGenerator = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    acceptanceCriteria: '',
    outputType: 'Procedural',
    language: 'English',
    swaggerUrl: '',
    priority: 'P2-Medium',
    severity: 'Major',
    testType: 'Functional',
    extendedOptions: 'Happy paths',
    refinementCount: 1
  });
  const [inputType, setInputType] = useState('text'); // 'text', 'image', or 'swagger'
  const [, setImageFiles] = useState([]);  // Only using the setter, not the state value
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentRefinement, setCurrentRefinement] = useState(0);
  const [originalResult, setOriginalResult] = useState('');
  const [parsedTestCases, setParsedTestCases] = useState([]);
  const [selectedTestCases, setSelectedTestCases] = useState({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [coverageData, setCoverageData] = useState(null);
  const [analyzingCoverage, setAnalyzingCoverage] = useState(false);
  const fileInputRef = useRef(null);
  const tokenContext = useToken();
  const apiToken = tokenContext ? tokenContext.apiToken : null;

  const { 
    acceptanceCriteria, 
    outputType, 
    language, 
    swaggerUrl,
    priority,
    severity,
    testType,
    extendedOptions,
    refinementCount
  } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  // Add this function to ensure unique IDs in the parsed test cases
  const ensureUniqueTestCaseIds = (testCases) => {
    const usedIds = new Set();
    
    return testCases.map((tc, index) => {
      if (!tc.id || usedIds.has(tc.id)) {
        // Generate a new unique ID based on the original ID pattern and index
        const baseId = tc.id ? tc.id.replace(/\d+$/, '') : 'TC-GEN-';
        const newId = `${baseId}${String(index + 1).padStart(3, '0')}`;
        
        return { ...tc, id: newId };
      }
      
      usedIds.add(tc.id);
      return tc;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    setCurrentRefinement(0);
    setOriginalResult('');
    setParsedTestCases([]);
    setSelectedTestCases({});

    try {
      // Check if API token exists
      if (!apiToken) {
        throw new Error('OpenAI API key is required. Please configure it in the settings page.');
      }

      let requestData = { ...formData };

      if (inputType === 'image' && imagePreviews.length > 0) {
        requestData.imageDataArray = imagePreviews;
        requestData.acceptanceCriteria = ''; 
        requestData.swaggerUrl = ''; 
      } else if (inputType === 'swagger') {
        requestData.imageDataArray = []; 
        requestData.acceptanceCriteria = ''; 
      } else {
        requestData.imageDataArray = []; 
        requestData.swaggerUrl = ''; 
      }

      // Add headers with API token
      const headers = {
        'x-openai-token': apiToken
      };

      const initialResponse = await axios.post('http://localhost:5000/api/generate-test-cases', requestData, { headers });
      
      // Add logging for the API response
      console.log('OpenAI API Response:', initialResponse.data);
      
      if (initialResponse.data.choices && initialResponse.data.choices[0]) {
        console.log('Response content:', initialResponse.data.choices[0].message.content);
        
        try {
          // Try to parse as JSON to examine structure
          const jsonContent = JSON.parse(initialResponse.data.choices[0].message.content);
          console.log('Parsed JSON structure:', jsonContent);
          
          if (jsonContent.testCases) {
            console.log(`Found ${jsonContent.testCases.length} test cases in response`);
            console.log('First test case sample:', jsonContent.testCases[0]);
          }
        } catch (parseError) {
          console.log('Response is not in JSON format:', parseError);
        }
      }
      
      let responseContent;
      
      try {
        if (initialResponse.data.choices && initialResponse.data.choices[0].message) {
          const content = initialResponse.data.choices[0].message.content;
          const jsonData = typeof content === 'string' ? JSON.parse(content) : content;
          
          if (jsonData.testCases) {
            // Validate and fix the configuration values in test cases
            if (Array.isArray(jsonData.testCases)) {
              jsonData.testCases = jsonData.testCases.map(tc => {
                // Ensure each test case has the correct configuration
                return {
                  ...tc,
                  priority: tc.priority || priority,
                  severity: tc.severity || severity,
                  tags: Array.isArray(tc.tags) 
                    ? tc.tags.includes(testType) && tc.tags.includes(extendedOptions)
                      ? tc.tags 
                      : [...new Set([...tc.tags, testType, extendedOptions])]
                    : [testType, extendedOptions]
                };
              });
            }

            const formattedTestCases = jsonData.testCases.map(tc => {
              return tc.format === 'Procedural' 
                ? generateProceduralMarkdown(tc) 
                : generateGherkinMarkdown(tc);
            }).join('\n\n---\n\n');
            
            responseContent = formattedTestCases;
            
            const processed = processStructuredTestCases(jsonData);
            const uniqueProcessed = ensureUniqueTestCaseIds(processed);
            setParsedTestCases(uniqueProcessed);
            
            const selected = {};
            uniqueProcessed.forEach(tc => {
              selected[tc.id] = true;
            });
            setSelectedTestCases(selected);
          } else {
            responseContent = JSON.stringify(jsonData, null, 2);
          }
        } else {
          responseContent = JSON.stringify(initialResponse.data, null, 2);
        }
      } catch (parseError) {
        console.error('Error parsing structured response:', parseError);
        responseContent = initialResponse.data.choices[0].message.content;
      }
      
      setOriginalResult(responseContent);
      setResult(responseContent);
      setCurrentRefinement(1);
      
      for (let i = 1; i < parseInt(refinementCount); i++) {
        if (responseContent) {
          const refinementResponse = await axios.post('http://localhost:5000/api/refine-test-cases', {
            testCases: responseContent,
            outputType,
            language
          }, { headers });
          
          responseContent = refinementResponse.data.choices[0].message.content;
          setResult(responseContent);
          setCurrentRefinement(i + 1);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.details || 
        err.response?.data?.error || 
        'Failed to generate test cases. Please try again.'
      );
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTestCase = (id) => {
    setSelectedTestCases(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectAllTestCases = () => {
    const selected = {};
    parsedTestCases.forEach(tc => {
      selected[tc.id] = true;
    });
    setSelectedTestCases(selected);
  };

  const deselectAllTestCases = () => {
    const selected = {};
    parsedTestCases.forEach(tc => {
      selected[tc.id] = false;
    });
    setSelectedTestCases(selected);
  };

  const saveSelectedTestCases = async () => {
    setSaveInProgress(true);
    setSaveMessage('');
    
    try {
      const selectedTests = parsedTestCases.filter(tc => selectedTestCases[tc.id]);
      
      if (selectedTests.length === 0) {
        setSaveMessage('Please select at least one test case to save');
        return;
      }
      
      // Define valid categories according to the backend validation
      const validCategories = ['API', 'UI', 'Functional', 'Performance', 'Security', 'Other'];
      
      console.log('Saving test cases:', selectedTests);
      
      const results = await Promise.all(selectedTests.map(async tc => {
        try {
          // Make sure we use a valid category or move the original category to tags
          let category = 'Other';
          let tags = Array.isArray(tc.tags) ? [...tc.tags] : [testType, extendedOptions];
          
          // If it's a valid category, use it
          if (tc.category && validCategories.includes(tc.category)) {
            category = tc.category;
          } else if (tc.category) {
            // If it's an invalid category, add it as a tag instead
            tags.push(tc.category);
          } else if (inputType === 'swagger') {
            category = 'API';
          } else if (inputType === 'image') {
            category = 'UI';
          } else {
            category = 'Functional';
          }
          
          // Remove duplicates from tags
          tags = [...new Set(tags)];
          
          const response = await axios.post('http://localhost:5000/api/test-cases', {
            title: tc.title,
            content: tc.content,
            format: tc.format || outputType,
            priority: tc.priority || priority,
            severity: tc.severity || severity,
            category: category,
            tags: tags,
            state: 'Draft',
            structuredData: tc.structuredData
          });
          
          console.log(`Successfully saved test case ${tc.id}:`, response.data);
          return { id: tc.id, success: true };
        } catch (error) {
          console.error(`Error saving test case ${tc.id}:`, error.response?.data || error);
          return { 
            id: tc.id, 
            success: false, 
            error: error.response?.data?.error || error.message 
          };
        }
      }));
      
      const successful = results.filter(r => r.success).length;
      setSaveMessage(`Successfully saved ${successful} of ${selectedTests.length} test cases`);
      
      if (successful === selectedTests.length) {
        setTimeout(() => {
          setShowSaveModal(false);
        }, 2000);
      }
    } catch (error) {
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setSaveInProgress(false);
    }
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (inputType === 'text') return !acceptanceCriteria;
    if (inputType === 'image') return imagePreviews.length === 0;
    if (inputType === 'swagger') return !swaggerUrl;
    return true;
  };

  const redirectToCodeGenerator = () => {
    localStorage.setItem('testCasesForAutomation', result);
    // Direct navigation to Code Generator
    setActiveComponent('testCodeGenerator');
  };

  const analyzeRequirementsCoverage = useCallback(async () => {
    if (parsedTestCases.length === 0) return;
    
    setAnalyzingCoverage(true);
    try {
      let requirements = '';
      if (inputType === 'text') {
        requirements = acceptanceCriteria;
      } else if (inputType === 'swagger') {
        requirements = swaggerUrl;
      } else if (inputType === 'image') {
        requirements = 'Image-based requirements';
      }
      
      const coverage = await analyzeCoverage({
        testCases: parsedTestCases,
        requirements,
        inputType,
        apiToken
      });
      
      setCoverageData(coverage);
    } catch (error) {
      console.error('Error analyzing coverage:', error);
    } finally {
      setAnalyzingCoverage(false);
    }
  }, [parsedTestCases, inputType, acceptanceCriteria, swaggerUrl, apiToken]);

  const generateMissingAreaTests = async () => {
    if (!coverageData?.missingAreas?.length) return;
    
    setLoading(true);
    try {
      const missingAreasText = coverageData.missingAreas
        .map(area => area.term || area.description)
        .join('\n- ');
        
      const refinementPrompt = `
Please generate additional test cases for these missing areas of coverage:
- ${missingAreasText}

Original requirements:
${inputType === 'text' ? acceptanceCriteria : 'See existing test cases for context'}
      `;
      
      const response = await axios.post('http://localhost:5000/api/generate-test-cases', {
        acceptanceCriteria: refinementPrompt,
        outputType,
        language
      }, {
        headers: apiToken ? { 'X-OpenAI-Token': apiToken } : {}
      });
      
      if (response.data.choices && response.data.choices[0].message) {
        try {
          const content = response.data.choices[0].message.content;
          const jsonData = typeof content === 'string' ? JSON.parse(content) : content;
          
          if (jsonData.testCases) {
            const newProcessed = processStructuredTestCases(jsonData);
            
            setParsedTestCases(prev => [...prev, ...newProcessed]);
            
            const newSelected = { ...selectedTestCases };
            newProcessed.forEach(tc => {
              newSelected[tc.id] = true;
            });
            setSelectedTestCases(newSelected);
            
            setTimeout(() => {
              analyzeRequirementsCoverage();
            }, 500);
          }
        } catch (error) {
          console.error('Error processing missing area test cases:', error);
        }
      }
    } catch (error) {
      console.error('Error generating missing area test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parsedTestCases.length > 0 && result) {
      analyzeRequirementsCoverage();
    }
  }, [parsedTestCases, result, analyzeRequirementsCoverage]);

  const renderImageUploadSection = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">
          Upload Screenshots:
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
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 002-2V6a2 2 002-2H6a2 2 00-2 2v12a2 2 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-400">Drag and drop images here, or click to select multiple</p>
            <p className="mt-1 text-xs text-gray-500">(Max total size: 16MB)</p>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        {imagePreviews.length > 0 ? `${imagePreviews.length} image(s) selected` : ''}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <ApiKeyCheck setActiveComponent={setActiveComponent} />
      
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Generate Test Cases</h3>
        
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
            Text Input
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
            Image Input
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
        
        <form onSubmit={onSubmit} className="flex flex-col">
          {inputType === 'text' ? (
            <div className="mb-6">
              <label htmlFor="acceptanceCriteria" className="block text-sm font-medium mb-2">
                Acceptance Criteria:
              </label>
              <textarea
                id="acceptanceCriteria"
                name="acceptanceCriteria"
                value={acceptanceCriteria}
                onChange={onChange}
                placeholder="Enter the acceptance criteria here..."
                className="w-full min-h-[200px] max-h-[40vh] bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required={inputType === 'text'}
              ></textarea>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  acceptanceCriteria: "As a user, I want to be able to reset my password so that I can regain access to my account if I forget my credentials."
                })}
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
                name="swaggerUrl"
                type="url"
                value={swaggerUrl}
                onChange={onChange}
                placeholder="Enter the Swagger/OpenAPI JSON URL here..."
                className="w-full bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required={inputType === 'swagger'}
              />
              <p className="mt-2 text-xs text-gray-400">
                Example: https://petstore.swagger.io/v2/swagger.json
              </p>
            </div>
          )}

          {/* Advanced configuration section */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 pb-1 border-b border-gray-700">Advanced Test Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {/* Priority select */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-2">
                  Priority:
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={priority}
                  onChange={onChange}
                  className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="P0-Critical">P0-Critical</option>
                  <option value="P1-High">P1-High</option>
                  <option value="P2-Medium">P2-Medium</option>
                  <option value="P3-Low">P3-Low</option>
                </select>
              </div>
              
              {/* Severity select */}
              <div>
                <label htmlFor="severity" className="block text-sm font-medium mb-2">
                  Severity:
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={severity}
                  onChange={onChange}
                  className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Blocker">Blocker</option>
                  <option value="Critical">Critical</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                </select>
              </div>
              
              {/* Test Type select */}
              <div>
                <label htmlFor="testType" className="block text-sm font-medium mb-2">
                  Test Type:
                </label>
                <select
                  id="testType"
                  name="testType"
                  value={testType}
                  onChange={onChange}
                  className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Functional">Functional</option>
                  <option value="Performance">Performance</option>
                  <option value="Security">Security</option>
                  <option value="Usability">Usability</option>
                  <option value="Localization">Localization</option>
                  <option value="Accessibility">Accessibility</option>
                  <option value="Compatibility">Compatibility</option>
                </select>
              </div>
              
              {/* Test Coverage select */}
              <div>
                <label htmlFor="extendedOptions" className="block text-sm font-medium mb-2">
                  Test Coverage:
                </label>
                <select
                  id="extendedOptions"
                  name="extendedOptions"
                  value={extendedOptions}
                  onChange={onChange}
                  className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Happy paths">Happy paths</option>
                  <option value="Negative paths">Negative paths</option>
                  <option value="Edge cases">Edge cases</option>
                  <option value="All possible paths">All possible paths</option>
                </select>
              </div>

              {/* Refinement count input */}
              <div>
                <label htmlFor="refinementCount" className="block text-sm font-medium mb-2">
                  Refinement Iterations:
                </label>
                <input
                  type="number"
                  id="refinementCount"
                  name="refinementCount"
                  value={refinementCount}
                  onChange={onChange}
                  min="1"
                  max="5"
                  className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Number of times to refine test cases (1-5)
                </p>
              </div>
            </div>
          </div>

          {/* Output format and language section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="outputType" className="block text-sm font-medium mb-2">
                Output Format:
              </label>
              <select
                id="outputType"
                name="outputType"
                value={outputType}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Procedural">Procedural</option>
                <option value="Gherkin">Gherkin</option>
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-2">
                Language:
              </label>
              <select
                id="language"
                name="language"
                value={language}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="English">English</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            className={`w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors ${
              isSubmitDisabled() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitDisabled()}
          >
            {loading ? 'Generating...' : 'Generate Test Cases'}
          </button>
        </form>
      </div>

      {/* Results section */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">Generated Test Cases</h3>
            {currentRefinement > 0 && (
              <p className="text-sm text-gray-400">
                Refinement: {currentRefinement} of {refinementCount}
                {currentRefinement > 1 && (
                  <button
                    onClick={() => setResult(originalResult)}
                    className="ml-2 text-blue-400 hover:text-blue-300 underline"
                  >
                    View original
                  </button>
                )}
              </p>
            )}
          </div>
          {result && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center gap-1 transition-colors"
              >
                Save to Library
              </button>
              <button
                type="button"
                onClick={redirectToCodeGenerator}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1 transition-colors"
              >
                Use in Code Generator
              </button>
              <button
                type="button"
                onClick={analyzeRequirementsCoverage}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm flex items-center gap-1 transition-colors"
              >
                {analyzingCoverage ? 'Analyzing...' : 'Analyze Coverage'}
              </button>
            </div>
          )}
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="animate-pulse mb-2">
              {currentRefinement === 0 
                ? "Generating test cases, please wait..." 
                : `Refining test cases (${currentRefinement}/${refinementCount}), please wait...`}
            </div>
            {currentRefinement > 0 && (
              <div className="w-full max-w-md bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(currentRefinement / refinementCount) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="max-h-[50vh] overflow-auto">
          {parsedTestCases.length > 0 ? (
            <div className="space-y-4">
              {parsedTestCases.map((testCase) => (
                <TestCaseCard 
                  key={testCase.id} 
                  testCase={testCase} 
                  setActiveComponent={setActiveComponent}
                />
              ))}
            </div>
          ) : result ? (
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    code: CodeBlock,
                    table: ({ node, ...props }) => (
                      <table className="w-full border-collapse my-4" {...props} />
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-gray-700" {...props} />
                    ),
                    tbody: ({ node, ...props }) => (
                      <tbody {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                      <tr className="border-b border-gray-700 hover:bg-gray-700/50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="p-2 text-left border border-gray-600 font-semibold" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="p-2 border border-gray-600" {...props} />
                    )
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </div>
          ) : loading ? (
            null
          ) : (
            <div className="text-center py-8 text-gray-500">
              Generate test cases to see results here
            </div>
          )}
        </div>

        {/* Coverage Report */}
        {coverageData && !loading && (
          <CoverageReport 
            coverageData={coverageData} 
            onRequestImprovement={generateMissingAreaTests} 
          />
        )}
      </div>

      {/* Save Modal */}
      <SaveTestCasesModal
        showModal={showSaveModal}
        setShowModal={setShowSaveModal}
        parsedTestCases={parsedTestCases}
        selectedTestCases={selectedTestCases}
        toggleTestCase={toggleTestCase}
        selectAllTestCases={selectAllTestCases}
        deselectAllTestCases={deselectAllTestCases}
        saveSelectedTestCases={saveSelectedTestCases}
        saveInProgress={saveInProgress}
        saveMessage={saveMessage}
      />
    </div>
  );
};

export default TestCaseGenerator;
