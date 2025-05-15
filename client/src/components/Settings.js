import React, { useState, useEffect } from 'react';
import { useToken } from '../context/TokenContext';
import { isValidModelName } from '../utils/apiUtils';

const Settings = () => {
  const { apiToken, setApiToken, modelName, setModelName } = useToken();
  const [localToken, setLocalToken] = useState(apiToken);
  const [localModelName, setLocalModelName] = useState(modelName || 'gpt-4.1-2025-04-14');
  const [showToken, setShowToken] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [modelWarning, setModelWarning] = useState('');
  
  // Validate model name when it changes
  useEffect(() => {
    if (localModelName && !isValidModelName(localModelName)) {
      setModelWarning('This model name doesn\'t match common OpenAI patterns. Make sure it\'s correct.');
    } else {
      setModelWarning('');
    }
  }, [localModelName]);
  
  const handleSave = () => {
    setApiToken(localToken);
    setModelName(localModelName);
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Application Settings</h3>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          OpenAI API Key:
        </label>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            value={localToken}
            onChange={(e) => setLocalToken(e.target.value)}
            placeholder="Enter your OpenAI API key here"
            className="w-full bg-gray-800 border border-gray-700 p-3 pr-10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
            onClick={() => setShowToken(!showToken)}
          >
            {showToken ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Your API key is stored locally in your browser and not shared with any server.
        </p>
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-sm text-blue-400 hover:text-blue-300 inline-block"
        >
          Get your API key from OpenAI →
        </a>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          OpenAI Model:
        </label>
        <input
          type="text"
          value={localModelName}
          onChange={(e) => setLocalModelName(e.target.value)}
          placeholder="Enter OpenAI model name (e.g., gpt-4.1-2025-04-14)"
          className={`w-full bg-gray-800 border ${modelWarning ? 'border-yellow-600' : 'border-gray-700'} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
        />
        {modelWarning && (
          <div className="mt-2 text-yellow-500 text-sm flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{modelWarning}</span>
          </div>
        )}
        <p className="mt-2 text-sm text-gray-400">
          Enter the OpenAI model name to use for generation. Default: gpt-4.1-2025-04-14
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Common models: gpt-4.1-2025-04-14, gpt-4o, gpt-4-turbo-2024-04-09, gpt-3.5-turbo
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
        >
          Save Settings
        </button>
        {saveMessage && (
          <span className="text-green-400 text-sm">{saveMessage}</span>
        )}
      </div>
    </div>
  );
};

export default Settings;
