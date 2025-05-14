import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const TestCaseGenerator = () => {
  const [formData, setFormData] = useState({
    acceptanceCriteria: '',
    outputType: 'Procedural',
    language: 'English'
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { acceptanceCriteria, outputType, language } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const res = await axios.post('/api/generate-test-cases', formData);
      setResult(res.data.choices[0].message.content);
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

  return (
    <div className="flex flex-col gap-8">
      {/* Input Panel - Always on top */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Generate Test Cases</h3>
        <form onSubmit={onSubmit} className="flex flex-col">
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
              required
            ></textarea>
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
              loading || !acceptanceCriteria ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading || !acceptanceCriteria}
          >
            {loading ? 'Generating...' : 'Generate Test Cases'}
          </button>
        </form>
      </div>

      {/* Output Panel - Always below */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Generated Test Cases</h3>
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-pulse">Generating test cases, please wait...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="max-h-[50vh] overflow-auto bg-gray-800 border border-gray-700 p-4 rounded-lg">
          {result && (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code: CodeBlock
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCaseGenerator;
