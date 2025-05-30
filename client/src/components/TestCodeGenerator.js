import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ApiKeyCheck from './common/ApiKeyCheck';
import { useToken } from '../context/TokenContext';

const TestCodeGenerator = ({ setActiveComponent }) => {
  const [formData, setFormData] = useState({
    testCase: '',
    framework: 'Playwright (JavaScript)'
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const { testCase, framework } = formData;
  const { apiToken, modelName } = useToken(); // Get both API token and model name

  const frameworks = [
    "Selenium WebDriver (Java)",
    "Selenium WebDriver (Python)",
    "Selenium WebDriver (JavaScript)",
    "Cypress",
    "Playwright (JavaScript)",
    "Playwright (Python)",
    "Playwright (Java)",
    "Playwright (C#)",
    "TestCafe",
    "Appium",
    "JUnit (Java)",
    "NUnit (C#)",
    "Mocha (JavaScript)",
    "Jasmine (JavaScript)",
    "Robot Framework",
    "Protractor",
    "Cucumber (Java)",
    "Cucumber (JavaScript)",
    "Postman",
    "RestAssured",
    "Katalon Studio",
    "Appium (Java)",
    "Detox (JavaScript)",
    "Espresso (Android)",
    "XCUITest (iOS)"
  ];

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult('');
    setCopied(false);

    try {
      if (!apiToken) {
        throw new Error('OpenAI API key is required. Please configure it in the settings.');
      }

      const response = await axios.post('http://localhost:5000/api/generate-test-code', {
        testCase,
        framework
      }, {
        headers: {
          'x-openai-token': apiToken,
          'X-OpenAI-Model': modelName // Add model name to headers
        }
      });

      setResult(response.data.choices[0].message.content);
    } catch (error) {
      setError(
        error.response?.data?.details || 
        error.response?.data?.error || 
        'Failed to generate test code. Please try again.'
      );
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        console.error('Failed to copy');
      }
    );
  };

  // Check for test cases passed from TestCaseGenerator
  useEffect(() => {
    const savedTestCases = localStorage.getItem('testCasesForAutomation');
    if (savedTestCases) {
      setFormData(prev => ({
        ...prev,
        testCase: savedTestCases
      }));
      // Clear the storage after using it
      localStorage.removeItem('testCasesForAutomation');
    }
  }, []);

  // Determine the language for syntax highlighting based on framework
  const getLanguage = () => {
    if (framework.includes('Java')) return 'java';
    if (framework.includes('Python')) return 'python';
    if (framework.includes('JavaScript') || framework.includes('Cypress') || 
        framework.includes('Mocha') || framework.includes('Jasmine') || 
        framework.includes('Protractor') || framework.includes('TestCafe') ||
        framework.includes('Detox')) return 'javascript';
    if (framework.includes('C#') || framework.includes('NUnit')) return 'csharp';
    if (framework.includes('Robot Framework')) return 'robotframework';
    if (framework.includes('Cucumber')) return 'gherkin';
    return 'javascript'; // Default
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <ApiKeyCheck setActiveComponent={setActiveComponent} />

      {/* Left Panel */}
      <div className="w-full md:w-1/2 bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Generate Test Automation Code</h3>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-6">
            <label htmlFor="testCase" className="block text-sm font-medium mb-2">
              Test Case:
            </label>
            <textarea
              id="testCase"
              name="testCase"
              value={testCase}
              onChange={onChange}
              placeholder="Enter your test case here. Be as detailed as possible about the steps to be performed..."
              className="w-full min-h-[200px] bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="framework" className="block text-sm font-medium mb-2">
              Automation Framework:
            </label>
            <select
              id="framework"
              name="framework"
              value={framework}
              onChange={onChange}
              className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {frameworks.map((fw) => (
                <option key={fw} value={fw}>
                  {fw}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className={`w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors ${
              loading || !testCase ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading || !testCase}
          >
            {loading ? 'Generating...' : 'Generate Test Code'}
          </button>
        </form>
      </div>

      {/* Output Panel */}
      <div className="w-full md:w-1/2 bg-gray-900 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Generated Test Code</h3>
          {result && (
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center gap-1"
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          )}
        </div>
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-pulse">Generating test code, please wait...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="max-h-[50vh] overflow-auto bg-gray-800 border border-gray-700 rounded-lg">
          {result && (
            <SyntaxHighlighter 
              language={getLanguage()} 
              style={vscDarkPlus}
              customStyle={{ 
                margin: 0, 
                padding: '1rem',
                borderRadius: '0.5rem', 
                backgroundColor: 'transparent',
                fontSize: '0.875rem'
              }}
              wrapLines={true}
              showLineNumbers={true}
            >
              {result}
            </SyntaxHighlighter>
          )}
        </div>
        {result && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Note:</strong> The code uses placeholders like <code className="bg-gray-800 px-1 rounded">insert_element_selector_here</code> for element selectors. Replace these with actual selectors based on your application's structure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCodeGenerator;
