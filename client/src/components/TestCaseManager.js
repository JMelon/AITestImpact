import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import { getPriorityColor, getSeverityColor } from '../utils/formatters';

const PRIORITY_OPTIONS = ['All', 'P0-Critical', 'P1-High', 'P2-Medium', 'P3-Low'];
const SEVERITY_OPTIONS = ['All', 'Blocker', 'Critical', 'Major', 'Minor'];
const FORMAT_OPTIONS = ['All', 'Procedural', 'Gherkin'];
const STATE_OPTIONS = ['All', 'Draft', 'Ready', 'In Progress', 'Pass', 'Fail', 'Blocked'];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const TestCaseManager = () => {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  // Fetch test cases on mount
  useEffect(() => {
    fetchTestCases();
    // eslint-disable-next-line
  }, []);

  const fetchTestCases = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/test-cases');
      setTestCases(res.data || []);
    } catch (err) {
      setError('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  useEffect(() => {
    let result = [...testCases];
    if (priorityFilter !== 'All') {
      result = result.filter(tc => tc.priority === priorityFilter);
    }
    if (severityFilter !== 'All') {
      result = result.filter(tc => tc.severity === severityFilter);
    }
    if (formatFilter !== 'All') {
      result = result.filter(tc => tc.format === formatFilter);
    }
    if (stateFilter !== 'All') {
      result = result.filter(tc => tc.state === stateFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(tc =>
        (tc.title && tc.title.toLowerCase().includes(s)) ||
        (tc.content && tc.content.toLowerCase().includes(s)) ||
        (tc.tags && tc.tags.join(' ').toLowerCase().includes(s))
      );
    }
    setFiltered(result);
    setPage(1); // Reset to first page on filter/search change
  }, [search, testCases, priorityFilter, severityFilter, formatFilter, stateFilter]);

  // Handle select all on current page
  const handleSelectAll = (checked, pagedTestCases) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(pagedTestCases.map(tc => tc._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle single row select
  const handleSelectRow = (id, checked) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(selId => selId !== id)
    );
  };

  // Bulk action handler
  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    setBulkActionInProgress(true);
    try {
      if (bulkAction === 'delete') {
        await Promise.all(selectedIds.map(id =>
          axios.delete(`http://localhost:5000/api/test-cases/${id}`)
        ));
      } else if (bulkAction.startsWith('set-status-')) {
        const newState = bulkAction.replace('set-status-', '');
        await Promise.all(selectedIds.map(id =>
          axios.put(`http://localhost:5000/api/test-cases/${id}`, { state: newState })
        ));
      }
      setSelectedIds([]);
      setSelectAll(false);
      setBulkAction('');
      fetchTestCases();
    } catch (err) {
      alert('Bulk action failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setBulkActionInProgress(false);
    }
  };

  // Paging logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedTestCases = filtered.slice((page - 1) * pageSize, page * pageSize);

  // CRUD: Edit
  const handleEdit = (tc) => {
    setEditId(tc._id);
    setEditData({
      title: tc.title || '',
      content: tc.content || '',
      priority: tc.priority || 'P2-Medium',
      severity: tc.severity || 'Major',
      format: tc.format || 'Procedural',
      tags: tc.tags ? tc.tags.join(', ') : '',
      state: tc.state || 'Draft',
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/test-cases/${id}`, {
        ...editData,
        tags: editData.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setEditId(null);
      fetchTestCases();
    } catch (err) {
      alert('Failed to update test case');
    }
  };

  // CRUD: Delete
  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/test-cases/${deleteId}`);
      setDeleteId(null);
      setDeleteConfirm(false);
      fetchTestCases();
    } catch (err) {
      alert('Failed to delete test case');
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteConfirm(false);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Test Case Library</h2>
          <p className="text-gray-400 text-sm">
            <span className="font-semibold text-blue-400">{filtered.length}</span> test{filtered.length !== 1 ? 's' : ''} shown.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1" htmlFor="searchFilter">Search</label>
            <input
              id="searchFilter"
              type="text"
              placeholder="Search by title, content, or tag..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              style={{ minWidth: 180 }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1" htmlFor="priorityFilter">Priority</label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white"
            >
              {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1" htmlFor="severityFilter">Severity</label>
            <select
              id="severityFilter"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white"
            >
              {SEVERITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1" htmlFor="formatFilter">Format</label>
            <select
              id="formatFilter"
              value={formatFilter}
              onChange={e => setFormatFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white"
            >
              {FORMAT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1" htmlFor="stateFilter">Status</label>
            <select
              id="stateFilter"
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white"
            >
              {STATE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={e => handleSelectAll(e.target.checked, pagedTestCases)}
          className="mr-2"
          aria-label="Select all on page"
        />
        <span className="text-xs text-gray-400 mr-2">Select All</span>
        <select
          value={bulkAction}
          onChange={e => setBulkAction(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white"
        >
          <option value="">Bulk Actions</option>
          <option value="delete">Delete Selected</option>
          <option value="set-status-Draft">Set Status: Draft</option>
          <option value="set-status-Ready">Set Status: Ready</option>
          <option value="set-status-In Progress">Set Status: In Progress</option>
          <option value="set-status-Pass">Set Status: Pass</option>
          <option value="set-status-Fail">Set Status: Fail</option>
          <option value="set-status-Blocked">Set Status: Blocked</option>
        </select>
        <button
          className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white ${bulkActionInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleBulkAction}
          disabled={!bulkAction || selectedIds.length === 0 || bulkActionInProgress}
        >
          Apply
        </button>
        {selectedIds.length > 0 && (
          <span className="text-xs text-gray-400 ml-2">{selectedIds.length} selected</span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No test cases found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg border border-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={e => handleSelectAll(e.target.checked, pagedTestCases)}
                      aria-label="Select all on page"
                    />
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">#</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left w-2/5">Title</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-1/12">Priority</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left whitespace-nowrap w-1/12">Severity</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left w-1/12">Tags</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">Format</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">Status</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">Details</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedTestCases.map((tc, idx) =>
                  editId === tc._id ? (
                    <tr key={tc._id || idx} className="bg-gray-900/80 border-b border-gray-700">
                      <td className="px-3 py-2 text-sm text-gray-400 align-top">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="px-3 py-2 align-top" colSpan={8}>
                        <form
                          className="bg-gray-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-6"
                          onSubmit={e => {
                            e.preventDefault();
                            handleEditSave(tc._id);
                          }}
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="edit-title">Title</label>
                              <input
                                id="edit-title"
                                type="text"
                                name="title"
                                value={editData.title}
                                onChange={handleEditChange}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="edit-priority">Priority</label>
                                <select
                                  id="edit-priority"
                                  name="priority"
                                  value={editData.priority}
                                  onChange={handleEditChange}
                                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-sm text-white"
                                >
                                  {PRIORITY_OPTIONS.slice(1).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="edit-severity">Severity</label>
                                <select
                                  id="edit-severity"
                                  name="severity"
                                  value={editData.severity}
                                  onChange={handleEditChange}
                                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-sm text-white"
                                >
                                  {SEVERITY_OPTIONS.slice(1).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="edit-format">Format</label>
                                <select
                                  id="edit-format"
                                  name="format"
                                  value={editData.format}
                                  onChange={handleEditChange}
                                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-sm text-white"
                                >
                                  {FORMAT_OPTIONS.slice(1).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="edit-tags">Tags</label>
                                <input
                                  id="edit-tags"
                                  type="text"
                                  name="tags"
                                  value={editData.tags}
                                  onChange={handleEditChange}
                                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-sm text-white"
                                  placeholder="Comma separated"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="edit-state">State</label>
                              <select
                                id="edit-state"
                                name="state"
                                value={editData.state}
                                onChange={handleEditChange}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-sm text-white"
                              >
                                <option value="Draft">Draft</option>
                                <option value="Ready">Ready</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Pass">Pass</option>
                                <option value="Fail">Fail</option>
                                <option value="Blocked">Blocked</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col h-full">
                            <label className="block text-xs font-semibold text-gray-400 mb-1" htmlFor="edit-content">Test Case Body</label>
                            <textarea
                              id="edit-content"
                              name="content"
                              value={editData.content}
                              onChange={handleEditChange}
                              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                              rows={18}
                              style={{ minHeight: 320, maxHeight: 700, resize: 'vertical' }}
                              placeholder="Test case body/content"
                            />
                            <div className="flex gap-2 mt-4 justify-end">
                              <button
                                type="button"
                                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white"
                                onClick={() => setEditId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-xs text-white"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <TestCaseRow
                      key={tc._id || idx}
                      testCase={tc}
                      index={(page - 1) * pageSize + idx}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      selected={selectedIds.includes(tc._id)}
                      onSelect={handleSelectRow}
                    />
                  )
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-2">
            <div className="text-xs text-gray-400 mb-2 md:mb-0">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                First
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="px-2 py-1 text-xs text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                Last
              </button>
              <div className="ml-4 flex items-center">
                <label className="text-xs text-gray-400 mr-2" htmlFor="pageSizeSelect">Per Page</label>
                <select
                  id="pageSizeSelect"
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white"
                >
                  {PAGE_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-400">Confirm Delete</h3>
            <p className="mb-6 text-gray-300">Are you sure you want to delete this test case?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TestCaseRow = ({ testCase, index, onEdit, onDelete, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className={`border-b border-gray-700 ${expanded ? 'bg-gray-900/70' : ''}`}>
        <td className="px-3 py-2">
          <input
            type="checkbox"
            checked={!!selected}
            onChange={e => onSelect(testCase._id, e.target.checked)}
            aria-label="Select row"
          />
        </td>
        <td className="px-3 py-2 text-sm text-gray-400">{index + 1}</td>
        <td className="px-3 py-2 text-sm font-medium text-white w-2/5">{testCase.title || <span className="italic text-gray-500">Untitled</span>}</td>
        <td className="px-3 py-2 w-1/12">
          <span className={`px-2 py-1 text-xs rounded whitespace-nowrap ${getPriorityColor(testCase.priority)}`}>
            {testCase.priority || '—'}
          </span>
        </td>
        <td className="px-3 py-2 w-1/12">
          <span className={`px-2 py-1 text-xs rounded whitespace-nowrap ${getSeverityColor(testCase.severity)}`}>
            {testCase.severity || '—'}
          </span>
        </td>
        <td className="px-3 py-2 w-1/12">
          {testCase.tags && testCase.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-[90px]">
              {testCase.tags.map((tag, i) => (
                <span key={i} className="bg-gray-700 text-xs px-1 py-0.5 rounded truncate">{tag}</span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500 text-xs">—</span>
          )}
        </td>
        <td className="px-3 py-2 text-xs text-gray-300">{testCase.format || '—'}</td>
        <td className="px-3 py-2 text-xs text-gray-300 whitespace-nowrap">{testCase.state || '—'}</td>
        <td className="px-3 py-2">
          <button
            className="text-blue-400 hover:text-blue-300 text-xs underline"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Hide' : 'Show'}
          </button>
        </td>
        <td className="px-3 py-2 flex gap-2">
          <button
            className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs text-white"
            onClick={() => onEdit(testCase)}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
            onClick={() => onDelete(testCase._id)}
          >
            Delete
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={10} className="bg-gray-900/80 px-6 py-4 border-b border-gray-800">
            <div className="prose prose-invert max-w-none text-sm">
              <ReactMarkdown components={{ code: CodeBlock }}>
                {testCase.content || '_No details available_'}
              </ReactMarkdown>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default TestCaseManager;
