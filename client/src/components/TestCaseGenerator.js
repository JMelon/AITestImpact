import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './TestCaseGenerator.css';

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
    <div className="test-case-generator">
      <div className="generator-container">
        <div className="input-section">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="acceptanceCriteria">Acceptance Criteria:</label>
              <textarea
                id="acceptanceCriteria"
                name="acceptanceCriteria"
                value={acceptanceCriteria}
                onChange={onChange}
                placeholder="Enter the acceptance criteria here..."
                rows="10"
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="outputType">Output Format:</label>
                <select
                  id="outputType"
                  name="outputType"
                  value={outputType}
                  onChange={onChange}
                >
                  <option value="Procedural">Procedural</option>
                  <option value="Gherkin">Gherkin</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="language">Language:</label>
                <select
                  id="language"
                  name="language"
                  value={language}
                  onChange={onChange}
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
              className="generate-btn"
              disabled={loading || !acceptanceCriteria}
            >
              {loading ? 'Generating...' : 'Generate Test Cases'}
            </button>
          </form>
        </div>

        <div className="result-section">
          <h3>Generated Test Cases</h3>
          {loading && <div className="loading">Generating test cases, please wait...</div>}
          {error && <div className="error">{error}</div>}
          <div className="result-content">
            {result && <ReactMarkdown>{result}</ReactMarkdown>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCaseGenerator;
