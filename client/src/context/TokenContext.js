import React, { createContext, useState, useContext, useEffect } from 'react';

const TokenContext = createContext();

export const TokenProvider = ({ children }) => {
  const [apiToken, setApiToken] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('openaiApiToken') || '';
  });
  
  const [hasAcceptedNoToken, setHasAcceptedNoToken] = useState(() => {
    return localStorage.getItem('hasAcceptedNoToken') === 'true';
  });

  // Save token to localStorage when it changes
  useEffect(() => {
    if (apiToken) {
      localStorage.setItem('openaiApiToken', apiToken);
    } else {
      localStorage.removeItem('openaiApiToken');
    }
  }, [apiToken]);

  // Save acceptance state to localStorage
  useEffect(() => {
    localStorage.setItem('hasAcceptedNoToken', hasAcceptedNoToken);
  }, [hasAcceptedNoToken]);

  const clearToken = () => {
    setApiToken('');
    localStorage.removeItem('openaiApiToken');
  };

  const acceptNoToken = () => {
    setHasAcceptedNoToken(true);
  };

  return (
    <TokenContext.Provider value={{ apiToken, setApiToken, clearToken, hasAcceptedNoToken, acceptNoToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);

export default TokenContext;
