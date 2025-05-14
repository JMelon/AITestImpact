import React, { useState, useEffect } from 'react';
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

const TestCaseManager = () => {
  // State variables
  const [testCases, setTestCases] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    format: 'Procedural',
    priority: 'P2-Medium',
    severity: 'Major',
    category: 'UI',
    tags: '',
    state: 'Draft',
    result: 'Not Run'
  });
  const [filterState, setFilterState] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterResult, setFilterResult] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedForBulkDelete, setSelectedForBulkDelete] = useState({});
  
  // Fetch test cases on mount
  useEffect(() => {
    fetchTestCases();
  }, []);

  // CRUD operations
  const fetchTestCases = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/test-cases');
      setTestCases(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch test cases');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewTestCase = async (id) => {
    setIsEditing(false);
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/test-cases/${id}`);
      setSelectedTestCase(response.data);
      setFormData({
        title: response.data.title,
        content: response.data.content,
        format: response.data.format,
        priority: response.data.priority,
        severity: response.data.severity,
        category: response.data.category,
        tags: response.data.tags.join(', '),
        state: response.data.state,
        result: response.data.result
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch test case details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTestCase = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/test-cases', {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      });
      
      // Reset form and fetch updated list
      setFormData({
        title: '',
        content: '',
        format: 'Procedural',
        priority: 'P2-Medium',
        severity: 'Major',
        category: 'UI',
        tags: '',
        state: 'Draft',
        result: 'Not Run'
      });
      setIsEditing(false);
      setSelectedTestCase(null);
      await fetchTestCases();
      setError('');
    } catch (err) {
      setError('Failed to create test case');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTestCase = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/test-cases/${selectedTestCase._id}`, {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      });
      
      setIsEditing(false);
      await fetchTestCases();
      // Refresh the selected test case view
      await viewTestCase(selectedTestCase._id);
      setError('');
    } catch (err) {
      setError('Failed to update test case');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete operations
  const initiateDelete = (id) => {
    const testCase = testCases.find(tc => tc._id === id);
    if (testCase) {
      setTestCaseToDelete(testCase);
      setShowDeleteModal(true);
    }
  };

  const deleteTestCase = async () => {
    if (!testCaseToDelete) return;
    
    setDeleteInProgress(true);
    try {
      await axios.delete(`http://localhost:5000/api/test-cases/${testCaseToDelete._id}`);
      
      setDeleteSuccess(true);
      
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteSuccess(false);
        setTestCaseToDelete(null);
        setSelectedTestCase(null);
        fetchTestCases();
      }, 1500);
    } catch (err) {
      setError(`Failed to delete test case: ${err.response?.data?.error || err.message}`);
      setTimeout(() => {
        setShowDeleteModal(false);
        setTestCaseToDelete(null);
      }, 2000);
    } finally {
      setDeleteInProgress(false);
    }
  };

  // Bulk delete operations
  const toggleBulkDeleteMode = () => {
    setBulkDeleteMode(!bulkDeleteMode);
    setSelectedForBulkDelete({});
  };

  const toggleBulkDeleteSelection = (id) => {
    setSelectedForBulkDelete(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectAllForBulkDelete = () => {
    const selected = {};
    filteredTestCases.forEach(tc => {
      selected[tc._id] = true;
    });
    setSelectedForBulkDelete(selected);
  };

  const deselectAllForBulkDelete = () => {
    setSelectedForBulkDelete({});
  };

  const bulkDeleteSelectedTestCases = async () => {
    const selectedIds = Object.keys(selectedForBulkDelete).filter(id => selectedForBulkDelete[id]);
    
    if (selectedIds.length === 0) {
      setError('No test cases selected for deletion');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} test cases? This cannot be undone.`)) {
      return;
    }
    
    setDeleteInProgress(true);
    try {
      await Promise.all(selectedIds.map(id => 
        axios.delete(`http://localhost:5000/api/test-cases/${id}`)
      ));
      
      setSelectedForBulkDelete({});
      setBulkDeleteMode(false);
      if (selectedIds.includes(selectedTestCase?._id)) {
        setSelectedTestCase(null);
      }
      
      await fetchTestCases();
      setError('');
    } catch (err) {
      setError(`Failed to delete test cases: ${err.response?.data?.error || err.message}`);
    } finally {
      setDeleteInProgress(false);
    }
  };

  // Form and UI handlers
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (selectedTestCase) {
      setFormData({
        title: selectedTestCase.title,
        content: selectedTestCase.content,
        format: selectedTestCase.format,
        priority: selectedTestCase.priority,
        severity: selectedTestCase.severity,
        category: selectedTestCase.category,
        tags: selectedTestCase.tags.join(', '),
        state: selectedTestCase.state,
        result: selectedTestCase.result
      });
    } else {
      setFormData({
        title: '',
        content: '',
        format: 'Procedural',
        priority: 'P2-Medium',
        severity: 'Major',
        category: 'UI',
        tags: '',
        state: 'Draft',
        result: 'Not Run'
      });
    }
    setIsEditing(false);
  };

  const startNew = () => {
    setSelectedTestCase(null);
    setFormData({
      title: '',
      content: '',
      format: 'Procedural',
      priority: 'P2-Medium',
      severity: 'Major',
      category: 'UI',
      tags: '',
      state: 'Draft',
      result: 'Not Run'
    });
    setIsEditing(true);
  };

  // Filtering and styling helpers
  const filteredTestCases = testCases.filter(testCase => {
    return (filterState === 'All' || testCase.state === filterState) &&
           (filterCategory === 'All' || testCase.category === filterCategory) &&
           (filterPriority === 'All' || testCase.priority === filterPriority) &&
           (filterResult === 'All' || testCase.result === filterResult) &&
           (searchTerm === '' || 
            testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testCase.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testCase.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
  });

  const getStateColor = (state) => {
    switch (state) {
      case 'Draft': return 'bg-blue-600';
      case 'Review': return 'bg-yellow-600';
      case 'Approved': return 'bg-green-600';
      case 'Obsolete': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Pass': return 'bg-green-600';
      case 'Fail': return 'bg-red-600';
      case 'Blocked': return 'bg-yellow-600';
      case 'Not Run': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P0-Critical': return 'bg-red-600';
      case 'P1-High': return 'bg-orange-600';
      case 'P2-Medium': return 'bg-yellow-600';
      case 'P3-Low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left sidebar with test case list */}
      <div className="w-full md:w-1/3 bg-gray-900 rounded-xl p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Test Cases</h3>
          <div className="flex gap-2">
            {bulkDeleteMode ? (
              <button
                onClick={toggleBulkDeleteMode}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                disabled={deleteInProgress}
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={startNew}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
              >
                New Test Case
              </button>
            )}
            <button
              onClick={toggleBulkDeleteMode}
              className={`px-3 py-1 rounded text-sm ${bulkDeleteMode ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {bulkDeleteMode ? 'Delete Selected' : 'Bulk Delete'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 bg-gray-800 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Filters</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="filterState" className="block text-xs mb-1">State</label>
              <select
                id="filterState"
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 py-1 px-2 rounded text-sm"
              >
                <option value="All">All States</option>
                <option value="Draft">Draft</option>
                <option value="Review">Review</option>
                <option value="Approved">Approved</option>
                <option value="Obsolete">Obsolete</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterCategory" className="block text-xs mb-1">Category</label>
              <select
                id="filterCategory"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 py-1 px-2 rounded text-sm"
              >
                <option value="All">All Categories</option>
                <option value="UI">UI</option>
                <option value="API">API</option>
                <option value="Integration">Integration</option>
                <option value="Performance">Performance</option>
                <option value="Security">Security</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterPriority" className="block text-xs mb-1">Priority</label>
              <select
                id="filterPriority"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 py-1 px-2 rounded text-sm"
              >
                <option value="All">All Priorities</option>
                <option value="P0-Critical">P0-Critical</option>
                <option value="P1-High">P1-High</option>
                <option value="P2-Medium">P2-Medium</option>
                <option value="P3-Low">P3-Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterResult" className="block text-xs mb-1">Result</label>
              <select
                id="filterResult"
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 py-1 px-2 rounded text-sm"
              >
                <option value="All">All Results</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Blocked">Blocked</option>
                <option value="Not Run">Not Run</option>
              </select>
            </div>
          </div>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Search by title, content or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 py-1 px-2 rounded text-sm"
            />
          </div>
        </div>

        {/* Test case list */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {bulkDeleteMode && filteredTestCases.length > 0 && (
            <div className="flex justify-between items-center mb-2 p-2 bg-gray-800 rounded">
              <div className="text-sm">
                {Object.values(selectedForBulkDelete).filter(Boolean).length} selected
              </div>
              <div className="flex gap-2">
                <button 
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={selectAllForBulkDelete}
                >
                  Select All
                </button>
                <button 
                  className="text-xs text-blue-400 hover:text-blue-300"
                  onClick={deselectAllForBulkDelete}
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}
          
          {loading && testCases.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="animate-pulse">Loading test cases...</div>
            </div>
          ) : filteredTestCases.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {testCases.length === 0 ? 
                "No test cases found. Create your first one!" : 
                "No test cases match your filters."}
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredTestCases.map(testCase => (
                <li 
                  key={testCase._id}
                  className={`border border-gray-700 rounded-lg p-3 ${
                    bulkDeleteMode ? '' : 'cursor-pointer hover:bg-gray-800'
                  } transition-colors ${
                    selectedTestCase?._id === testCase._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => !bulkDeleteMode && viewTestCase(testCase._id)}
                >
                  <div className="flex justify-between mb-1">
                    {bulkDeleteMode ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={!!selectedForBulkDelete[testCase._id]}
                          onChange={() => toggleBulkDeleteSelection(testCase._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4"
                        />
                        <h4 className="font-medium truncate">{testCase.title}</h4>
                      </div>
                    ) : (
                      <h4 className="font-medium truncate">{testCase.title}</h4>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(testCase.priority)}`}>
                      {testCase.priority}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {testCase.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs bg-gray-700 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded ${getStateColor(testCase.state)}`}>
                      {testCase.state}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getResultColor(testCase.result)}`}>
                      {testCase.result}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {bulkDeleteMode && Object.values(selectedForBulkDelete).some(Boolean) && (
            <div className="mt-4 flex justify-center">
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
                onClick={bulkDeleteSelectedTestCases}
                disabled={deleteInProgress}
              >
                {deleteInProgress ? 'Deleting...' : `Delete ${Object.values(selectedForBulkDelete).filter(Boolean).length} Test Cases`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right panel with test case details or editor */}
      <div className="w-full md:w-2/3 bg-gray-900 rounded-xl p-6 overflow-hidden flex flex-col">
        {loading && selectedTestCase === null && !isEditing ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="animate-pulse">Loading...</div>
          </div>
        ) : isEditing ? (
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-semibold mb-4">
              {selectedTestCase ? 'Edit Test Case' : 'Create New Test Case'}
            </h3>
            
            <form onSubmit={selectedTestCase ? updateTestCase : createTestCase} className="flex flex-col flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title:
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="format" className="block text-sm font-medium mb-1">
                    Format:
                  </label>
                  <select
                    id="format"
                    name="format"
                    value={formData.format}
                    onChange={onChange}
                    className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg"
                  >
                    <option value="Procedural">Procedural</option>
                    <option value="Gherkin">Gherkin</option>
                  </select>
                </div>
              </div>

              <div className="mb-4 flex-1">
                <label htmlFor="content" className="block text-sm font-medium mb-1">
                  Content:
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={onChange}
                  required
                  className="w-full h-[calc(100%-1.75rem)] min-h-[200px] bg-gray-800 border border-gray-700 p-2 rounded-lg"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-1">
                    Priority:
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={onChange}
                    className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg"
                  >
                    <option value="P0-Critical">P0-Critical</option>
                    <option value="P1-High">P1-High</option>
                    <option value="P2-Medium">P2-Medium</option>
                    <option value="P3-Low">P3-Low</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium mb-1">
                    Severity:
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={onChange}
                    className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg"
                  >
                    <option value="Blocker">Blocker</option>
                    <option value="Critical">Critical</option>
                    <option value="Major">Major</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">
                    Category:
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={onChange}
                    className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg"
                  >
                    <option value="UI">UI</option>
                    <option value="API">API</option>
                    <option value="Integration">Integration</option>
                    <option value="Performance">Performance</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">
                    State:
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={onChange}
                    className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Review">Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Obsolete">Obsolete</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-1">
                    Tags (comma separated):
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={onChange}
                    placeholder="e.g., login, security, responsive"
                    className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg"
                  />
                </div>
                {selectedTestCase && (
                  <div>
                    <label htmlFor="result" className="block text-sm font-medium mb-1">
                      Result:
                    </label>
                    <select
                      id="result"
                      name="result"
                      value={formData.result}
                      onChange={onChange}
                      className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg"
                    >
                      <option value="Not Run">Not Run</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : selectedTestCase ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        ) : selectedTestCase ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{selectedTestCase.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={startEditing}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => initiateDelete(selectedTestCase._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <div className={`px-2 py-1 rounded text-sm ${getStateColor(selectedTestCase.state)}`}>
                {selectedTestCase.state}
              </div>
              <div className={`px-2 py-1 rounded text-sm ${getResultColor(selectedTestCase.result)}`}>
                {selectedTestCase.result}
              </div>
              <div className={`px-2 py-1 rounded text-sm ${getPriorityColor(selectedTestCase.priority)}`}>
                {selectedTestCase.priority}
              </div>
              <div className="px-2 py-1 bg-gray-700 rounded text-sm">
                {selectedTestCase.severity}
              </div>
              <div className="px-2 py-1 bg-gray-700 rounded text-sm">
                {selectedTestCase.category}
              </div>
              <div className="px-2 py-1 bg-gray-700 rounded text-sm">
                {selectedTestCase.format}
              </div>
            </div>

            {selectedTestCase.tags.length > 0 && (
              <div className="mb-4">
                <span className="text-sm text-gray-400">Tags: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTestCase.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Test case content */}
            <div className="flex-1 overflow-y-auto bg-gray-800 border border-gray-700 p-4 rounded-lg mb-4">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown components={{ code: CodeBlock }}>
                  {selectedTestCase.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* History accordion */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-3 font-medium cursor-pointer list-none bg-gray-800 hover:bg-gray-700">
                  <span>History ({selectedTestCase.history.length} versions)</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="bg-gray-800 border-t border-gray-700 p-3 max-h-60 overflow-y-auto">
                  {selectedTestCase.history.length === 0 ? (
                    <p className="text-gray-400 text-sm">No history available</p>
                  ) : (
                    <ul className="space-y-3">
                      {selectedTestCase.history.map((item, index) => (
                        <li key={index} className="text-sm border-b border-gray-700 pb-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400">
                              Version {selectedTestCase.history.length - index}
                            </span>
                            <span className="text-gray-500">
                              {new Date(item.updatedAt).toLocaleString()} by {item.updatedBy}
                            </span>
                          </div>
                          <div className="bg-gray-900 p-2 rounded-lg max-h-28 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-xs">{item.content}</pre>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="mb-4">Select a test case from the list or create a new one</p>
              <button
                onClick={startNew}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Create New Test Case
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && testCaseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            {deleteSuccess ? (
              <div className="text-center">
                <div className="text-green-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Test Case Deleted</h3>
                <p className="text-gray-400 mb-4">The test case has been successfully deleted.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
                <p className="mb-6">
                  Are you sure you want to delete the test case "{testCaseToDelete.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setTestCaseToDelete(null);
                    }}
                    disabled={deleteInProgress}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center gap-2 ${
                      deleteInProgress ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={deleteTestCase}
                    disabled={deleteInProgress}
                  >
                    {deleteInProgress ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseManager;
