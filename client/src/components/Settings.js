import React, { useState, useEffect } from 'react';
import { useToken } from '../context/TokenContext';

const Settings = () => {
  const { apiToken, setApiToken } = useToken();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Load saved API key on component mount
  useEffect(() => {
    if (apiToken) {
      setApiKey(apiToken);
    }
  }, [apiToken]);
  
  const saveApiKey = () => {
    setIsSaving(true);
    setMessage('');
    setError('');
    
    try {
      // Basic validation
      if (!apiKey) {
        setError('Please enter an API key');
        setIsSaving(false);
        return;
      }
      
      if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
        setError("This doesn't look like a valid OpenAI API key. Keys should start with 'sk-' and be at least 20 characters long.");
        setIsSaving(false);
        return;
      }
      
      // Save to context which will persist to local storage
      setApiToken(apiKey);
      
      setMessage('API key saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to save API key: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const clearApiKey = () => {
    setApiKey('');
    setApiToken('');
    setMessage('API key removed');
    setTimeout(() => setMessage(''), 3000);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-6">Settings</h3>
        
        <div className="mb-8">
          <h4 className="text-md font-medium mb-4 pb-2 border-b border-gray-700">API Configuration</h4>
          
          <div className="mb-6">
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              OpenAI API Key:
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              <p>Your API key is stored in your browser's local storage and is only sent to the OpenAI API.</p>
              <p>Don't have an API key? <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Get one from OpenAI</a></p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={saveApiKey}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save API Key'}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              onClick={clearApiKey}
            >
              Clear API Key
            </button>
          </div>
          
          {message && (
            <div className="mt-4 p-3 bg-green-900/50 border border-green-700 text-green-300 rounded-lg">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
              {error}
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-700 pt-6">
          <h4 className="text-md font-medium mb-4">API Key Usage Information</h4>
          <div className="p-4 bg-gray-800 rounded-lg">
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Your OpenAI API key is required to use AI features in this application.</li>
              <li>The key is stored only in your browser's local storage and is not sent to any servers except OpenAI's API servers.</li>
              <li>Using your own API key means you control access and usage limits.</li>
              <li>API usage will be billed to your OpenAI account based on your usage of this application.</li>
              <li>Be sure to follow <a href="https://openai.com/api/policies/service-terms/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">OpenAI's terms of service</a>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
