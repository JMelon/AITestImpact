import React, { createContext, useState, useContext, useEffect } from 'react';

const TokenContext = createContext();

export function TokenProvider({ children }) {
  const [apiToken, setApiToken] = useState(() => {
    return localStorage.getItem('openai_api_token') || '';
  });
  
  const [modelName, setModelName] = useState(() => {
    return localStorage.getItem('openai_model_name') || 'gpt-4.1-2025-04-14';
  });

  // Store token in localStorage when it changes
  useEffect(() => {
    if (apiToken) {
      localStorage.setItem('openai_api_token', apiToken);
    } else {
      localStorage.removeItem('openai_api_token');
    }
  }, [apiToken]);

  // Store model name in localStorage when it changes
  useEffect(() => {
    if (modelName) {
      localStorage.setItem('openai_model_name', modelName);
    } else {
      localStorage.setItem('openai_model_name', 'gpt-4.1-2025-04-14'); // Default value
    }
  }, [modelName]);

  return (
    <TokenContext.Provider value={{ apiToken, setApiToken, modelName, setModelName }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  return useContext(TokenContext);
}
