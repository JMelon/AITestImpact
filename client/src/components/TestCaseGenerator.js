import React, { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// eslint-disable-next-line no-unused-vars
import { parseTestCases } from '../utils/testCaseParser';
// eslint-disable-next-line no-unused-vars
import testCaseProcessor, { generateProceduralMarkdown, generateGherkinMarkdown, processStructuredTestCases } from '../utils/testCaseProcessor';

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

const TestCaseCard = ({ testCase }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Helper function to get color class based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0-Critical': return 'bg-red-600';
      case 'P1-High': return 'bg-orange-600';
      case 'P2-Medium': return 'bg-yellow-600';
      case 'P3-Low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  // Helper function to get color class based on severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Blocker': return 'bg-red-700';
      case 'Critical': return 'bg-red-600';
      case 'Major': return 'bg-orange-600';
      case 'Minor': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg mb-4 overflow-hidden">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg mb-2">{testCase.title}</h3>
          <div className="flex space-x-2">
            {testCase.priority && (
              <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(testCase.priority)}`}>
                {testCase.priority}
              </span>
            )}
            {testCase.severity && (
              <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(testCase.severity)}`}>
                {testCase.severity}
              </span>
            )}
            {testCase.format && (
              <span className="bg-gray-700 px-2 py-1 text-xs rounded">
                {testCase.format}
              </span>
            )}
          </div>
        </div>
        
        {testCase.structuredData && testCase.format === 'Procedural' && (
          <div className="mt-2 text-sm text-gray-300">
            <p>{testCase.structuredData.objective}</p>
          </div>
        )}
        
        {testCase.tags && testCase.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {testCase.tags.map((tag, idx) => (
              <span key={idx} className="bg-gray-700 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-3 flex items-center text-gray-400 text-sm">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="ml-1">{expanded ? 'Hide details' : 'Show details'}</span>
        </div>
      </div>
      
      {expanded && (
        <div className="border-t border-gray-700 p-4">
          {testCase.format === 'Procedural' && testCase.structuredData && testCase.structuredData.procedural ? (
            // Procedural test case details
            <div className="space-y-4">
              {testCase.structuredData.preconditions && testCase.structuredData.preconditions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Preconditions:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {testCase.structuredData.preconditions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testCase.structuredData.steps && testCase.structuredData.steps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Steps:</h4>
                  <div className="bg-gray-900 rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="py-2 px-3 text-left w-12">#</th>
                          <th className="py-2 px-3 text-left">Step</th>
                          <th className="py-2 px-3 text-left">Expected Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testCase.structuredData.steps.map((step, idx) => (
                          <tr key={idx} className="border-t border-gray-800 hover:bg-gray-800/50">
                            <td className="py-2 px-3">{step.number || idx + 1}</td>
                            <td className="py-2 px-3">{step.description}</td>
                            <td className="py-2 px-3 text-green-400">{step.expectedResult}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {testCase.structuredData.postconditions && testCase.structuredData.postconditions.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Postconditions:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {testCase.structuredData.postconditions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : testCase.format === 'Gherkin' && testCase.structuredData && testCase.structuredData.gherkin ? (
            // Gherkin test case details
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-1">Feature:</h4>
                <p className="text-sm bg-gray-900 p-2 rounded">{testCase.structuredData.feature}</p>
              </div>
              
              {testCase.structuredData.background && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Background:</h4>
                  <pre className="text-sm bg-gray-900 p-2 rounded overflow-x-auto">{testCase.structuredData.background}</pre>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-sm text-gray-300 mb-1">{testCase.structuredData.scenarioType || 'Scenario'}:</h4>
                <p className="text-sm">{testCase.title}</p>
              </div>
              
              {testCase.structuredData.givenSteps && testCase.structuredData.givenSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-green-500 mb-1">Given:</h4>
                  <ul className="space-y-1 text-sm">
                    {testCase.structuredData.givenSteps.map((step, idx) => (
                      <li key={idx} className="bg-gray-900 p-2 rounded">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testCase.structuredData.whenSteps && testCase.structuredData.whenSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-blue-500 mb-1">When:</h4>
                  <ul className="space-y-1 text-sm">
                    {testCase.structuredData.whenSteps.map((step, idx) => (
                      <li key={idx} className="bg-gray-900 p-2 rounded">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testCase.structuredData.thenSteps && testCase.structuredData.thenSteps.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-purple-500 mb-1">Then:</h4>
                  <ul className="space-y-1 text-sm">
                    {testCase.structuredData.thenSteps.map((step, idx) => (
                      <li key={idx} className="bg-gray-900 p-2 rounded">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {testCase.structuredData.examples && (
                <div>
                  <h4 className="font-medium text-sm text-gray-300 mb-1">Examples:</h4>
                  <pre className="text-sm bg-gray-900 p-2 rounded overflow-x-auto">{testCase.structuredData.examples}</pre>
                </div>
              )}
            </div>
          ) : (
            // Fallback to raw content if structured data is not available
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown components={{ code: CodeBlock }}>
                {testCase.content}
              </ReactMarkdown>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              onClick={(e) => {
                e.stopPropagation();
                localStorage.setItem('testCasesForAutomation', testCase.content);
                const buttons = document.querySelectorAll('button');
                const testCodeButton = Array.from(buttons).find(
                  (button) => button.textContent.includes('Test Code Generator')
                );
                if (testCodeButton) {
                  testCodeButton.click();
                }
              }}
            >
              Generate Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TestCaseGenerator = () => {
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
  // eslint-disable-next-line no-unused-vars
  const [imageFiles, setImageFiles] = useState([]);
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
  const fileInputRef = useRef(null);

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
      processImageFiles(files);
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
      processImageFiles(Array.from(e.dataTransfer.files));
    }
  };

  const processImageFiles = (files) => {
    const imageFiles = files.filter(file => file.type.match('image.*'));
    
    if (imageFiles.length === 0) {
      setError('Please select image files (PNG, JPG, JPEG, etc.)');
      return;
    }

    const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 16 * 1024 * 1024) {
      setError('Total image size should be less than 16MB');
      return;
    }

    setImageFiles(prevFiles => [...prevFiles, ...imageFiles]);
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        compressImage(reader.result, 0.7, (compressedDataUrl) => {
          setImagePreviews(prev => [...prev, compressedDataUrl]);
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const compressImage = (dataUrl, quality = 0.7, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      let width = img.width;
      let height = img.height;
      
      const MAX_SIZE = 1600;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(compressedDataUrl);
    };
    img.src = dataUrl;
  };

  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
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

      const initialResponse = await axios.post('http://localhost:5000/api/generate-test-cases', requestData);
      
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
            const formattedTestCases = jsonData.testCases.map(tc => {
              return tc.format === 'Procedural' 
                ? generateProceduralMarkdown(tc) 
                : generateGherkinMarkdown(tc);
            }).join('\n\n---\n\n');
            
            responseContent = formattedTestCases;
            
            const processed = processStructuredTestCases(jsonData);
            setParsedTestCases(processed);
            
            const selected = {};
            processed.forEach(tc => {
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
          });
          
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

  return (
    <div className="flex flex-col gap-8">
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
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  Upload Screenshots:
                </label>
                {imagePreviews.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllImages}
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
                            removeImage(index);
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
                    <p className="mt-2 text-sm text-gray-400">Drag and drop images here, or click to select multiple</p>
                    <p className="mt-1 text-xs text-gray-500">(Max total size: 16MB)</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {imagePreviews.length > 0 ? `${imagePreviews.length} image(s) selected` : ''}
              </p>
            </div>
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

          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 pb-1 border-b border-gray-700">Advanced Test Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                onClick={() => {
                  localStorage.setItem('testCasesForAutomation', result);
                  if (typeof window !== 'undefined') {
                    const buttons = document.querySelectorAll('button');
                    const testCodeButton = Array.from(buttons).find(
                      (button) => button.textContent.includes('Test Code Generator')
                    );
                    if (testCodeButton) {
                      testCodeButton.click();
                    }
                  }
                }}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center gap-1 transition-colors"
              >
                Use in Code Generator
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
                <TestCaseCard key={testCase.id} testCase={testCase} />
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
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Save Test Cases</h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowSaveModal(false)}
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
                onClick={() => setShowSaveModal(false)}
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
      )}
    </div>
  );
};

export default TestCaseGenerator;
