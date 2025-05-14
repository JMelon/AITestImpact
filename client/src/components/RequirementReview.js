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

const RequirementReview = () => {
  const [requirements, setRequirements] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await axios.post('http://localhost:5000/api/review-requirements', {
        requirements
      });
      setResult(response.data.choices[0].message.content);
    } catch (err) {
      setError(
        err.response?.data?.details || 
        err.response?.data?.error || 
        'Failed to analyze requirements. Please try again.'
      );
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = () => {
    setRequirements(`# User Authentication System

## Functional Requirements

1. Users should be able to register with email and password
2. Users should be able to log in with their credentials
3. Users should be able to reset their password via email
4. Users should be logged out after 30 minutes of inactivity
5. System should lock accounts after 5 failed login attempts
6. Users should be able to change their email address

## Non-Functional Requirements

1. Login process should complete in under 2 seconds
2. System should support 10,000 concurrent users
3. Password must be at least 8 characters
4. System should be available 99.9% of the time`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Input Panel */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Requirement Review</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-6">
            <label htmlFor="requirements" className="block text-sm font-medium mb-2">
              Requirements:
            </label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Paste your requirements here..."
              className="w-full min-h-[200px] max-h-[40vh] bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            ></textarea>
            <button
              type="button"
              onClick={handleExampleClick}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Fill with example
            </button>
          </div>

          <button 
            type="submit" 
            className={`w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors ${
              loading || !requirements ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading || !requirements}
          >
            {loading ? 'Analyzing...' : 'Analyze Requirements'}
          </button>
        </form>
      </div>

      {/* Output Panel */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Analysis Results</h3>
        
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-pulse">Analyzing requirements, please wait...</div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RequirementReview;
