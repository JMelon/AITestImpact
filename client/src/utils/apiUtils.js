/**
 * Validates if a model name is likely to be valid
 * @param {string} modelName - The model name to validate
 * @returns {boolean} Whether the model name is valid
 */
export const isValidModelName = (modelName) => {
  if (!modelName || typeof modelName !== 'string') return false;
  
  // Basic validation for common OpenAI model naming patterns
  const validPatterns = [
    /^gpt-4\.1/,          // gpt-4.1 series
    /^gpt-4o/,            // gpt-4o
    /^gpt-4-turbo/,       // gpt-4-turbo models
    /^gpt-4-vision/,      // vision models
    /^gpt-4-\d{4}-\d{2}/,  // gpt-4-YYYY-MM pattern
    /^gpt-3\.5-turbo/,    // gpt-3.5 models
    /^gpt-3\.5-\d{4}-\d{2}/ // gpt-3.5-YYYY-MM pattern
  ];
  
  return validPatterns.some(pattern => pattern.test(modelName));
};

/**
 * Formats an OpenAI API error into a user-friendly message
 * @param {Error} error - The error object from the API call
 * @returns {Object} Formatted error with message and suggestion
 */
export const formatApiError = (error) => {
  // Check for model_not_found error
  if (error.response?.data?.code === 'model_not_found') {
    return {
      title: 'Invalid AI Model',
      message: error.response.data.details || 'The specified AI model was not found or you don\'t have access to it.',
      suggestion: 'Try updating the model name in Settings to "gpt-4.1-2025-04-14" or another available model.',
      isModelError: true
    };
  }
  
  // Detect if error message contains model information
  if (error.response?.data?.error?.message?.includes('model') && 
      error.response?.data?.error?.type === 'invalid_request_error') {
    return {
      title: 'AI Model Error',
      message: error.response.data.error.message,
      suggestion: 'Check your model settings and ensure you have access to the specified model.',
      isModelError: true
    };
  }
  
  // Rate limit error
  if (error.response?.status === 429) {
    return {
      title: 'Rate Limit Exceeded',
      message: 'You have sent too many requests to the AI service.',
      suggestion: 'Please wait a moment before trying again.',
      isRateLimit: true
    };
  }
  
  // API key error
  if (error.response?.status === 401) {
    return {
      title: 'Authentication Error',
      message: 'Your API key appears to be invalid or expired.',
      suggestion: 'Please update your API key in the Settings page.',
      isAuthError: true
    };
  }
  
  // Generic error fallback
  return {
    title: 'Error',
    message: error.response?.data?.error || error.response?.data?.details || error.message || 'An unexpected error occurred',
    suggestion: 'Please try again or check your settings.',
    isUnknownError: true
  };
};

/**
 * Creates standard headers for API requests
 * @param {string} apiToken - The API token
 * @param {string} modelName - The model name
 * @returns {Object} Headers object for API requests
 */
export const createApiHeaders = (apiToken, modelName) => {
  // Fallback to default model if the provided one doesn't look valid
  const defaultModel = 'gpt-4.1-2025-04-14';
  const finalModel = isValidModelName(modelName) ? modelName : defaultModel;
  
  if (!isValidModelName(modelName) && modelName) {
    console.warn(`Model name "${modelName}" may be invalid, falling back to ${defaultModel}`);
  }
  
  return {
    'X-OpenAI-Token': apiToken,
    'X-OpenAI-Model': finalModel
  };
};

export default {
  isValidModelName,
  formatApiError,
  createApiHeaders
};
