import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const TokenContext = createContext();

// Custom hook to use the token context
export const useToken = () => useContext(TokenContext);

// Provider component
export const TokenProvider = ({ children }) => {
  const [apiToken, setApiTokenState] = useState('');

  // On component mount, try to load token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('openai_api_token');
    if (storedToken) {
      setApiTokenState(storedToken);
    }
  }, []);

  // Custom setter that also updates localStorage
  const setApiToken = (token) => {
    if (token) {
      localStorage.setItem('openai_api_token', token);
    } else {
      localStorage.removeItem('openai_api_token');
    }
    setApiTokenState(token);
  };

  // Provide the token and setter to children
  return (
    <TokenContext.Provider value={{ apiToken, setApiToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export default TokenContext;
