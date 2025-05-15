import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const SearchBar = ({ onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Wrap handleSearchSubmit in useCallback to prevent recreation on every render
  const handleSearchSubmit = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the API for searching test cases
      const response = await axios.get(`http://localhost:5000/api/test-cases/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.data && response.data.length > 0) {
        // Format test case results
        const testCaseResults = response.data.map(item => ({
          id: item._id,
          title: item.title,
          content: item.content.substring(0, 100) + '...',
          type: 'Test Case',
          category: item.category,
          tags: item.tags
        }));
        
        // Combine with documentation search results
        const documentationResults = searchDocumentation(searchTerm);
        
        setResults([...testCaseResults, ...documentationResults]);
      } else {
        // If no test cases, just return documentation results
        setResults(searchDocumentation(searchTerm));
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Fallback to documentation search only
      setResults(searchDocumentation(searchTerm));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Simple function to search documentation - would be more sophisticated in a real app
  const searchDocumentation = (term) => {
    const documentationSections = [
      { id: 'overview', title: 'Platform Overview', content: 'Overview of the TestMatrix platform and its capabilities.', type: 'Documentation' },
      { id: 'getting-started', title: 'Getting Started Guide', content: 'How to get started with TestMatrix.', type: 'Documentation' },
      { id: 'test-case-generator', title: 'Test Case Generator Documentation', content: 'Generate test cases from various inputs including requirements, UI designs, or API specs.', type: 'Documentation' },
      { id: 'coverage-analyzer', title: 'Coverage Analyzer Documentation', content: 'Analyze test coverage against requirements to identify gaps.', type: 'Documentation' },
      { id: 'api-docs', title: 'API Reference', content: 'Detailed API documentation for integrating with TestMatrix.', type: 'Documentation' }
    ];
    
    return documentationSections.filter(section => 
      section.title.toLowerCase().includes(term.toLowerCase()) || 
      section.content.toLowerCase().includes(term.toLowerCase())
    );
  };

  const handleResultClick = (result) => {
    if (onResultClick) {
      onResultClick(result);
    }
    setShowResults(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearchSubmit();
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, handleSearchSubmit]);

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full bg-gray-800/80 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {showResults && (
        <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              <ul>
                {results.map((result) => (
                  <li key={result.id} className="border-b border-gray-700 last:border-0">
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-200">{result.title}</div>
                          <div className="text-xs text-gray-400 mt-1">{result.content}</div>
                        </div>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          result.type === 'Test Case' ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'
                        }`}>
                          {result.type}
                        </span>
                      </div>
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {result.tags.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                              +{result.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-400">
              No results found for "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
