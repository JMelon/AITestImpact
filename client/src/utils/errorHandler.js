/**
 * Handles API errors consistently across the application
 * @param {Error} error - The error object from the API call
 * @returns {Object} Formatted error response
 */
export const handleApiError = (error) => {
  // Check if it's a response from our backend with structured error
  if (error.response?.data?.error) {
    return {
      message: error.response.data.error,
      details: error.response.data.details || '',
      status: error.response.status,
      isApiError: true
    };
  }
  
  // Network errors
  if (error.message === 'Network Error') {
    return {
      message: 'Unable to connect to the server',
      details: 'Please check your internet connection and try again.',
      isNetworkError: true
    };
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return {
      message: 'Request timeout',
      details: 'The server took too long to respond. Please try again later.',
      isTimeoutError: true
    };
  }
  
  // Generic error fallback
  return {
    message: error.message || 'An unexpected error occurred',
    details: '',
    isUnknownError: true
  };
};

/**
 * Formats validation errors from form submissions
 * @param {Object} errors - Validation errors object
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return '';
  
  if (typeof errors === 'string') return errors;
  
  if (Array.isArray(errors)) {
    return errors.join('. ');
  }
  
  // If errors is an object with field names as keys
  return Object.keys(errors)
    .map(field => `${field}: ${errors[field]}`)
    .join('. ');
};

// Fix: Assign object to a variable before exporting as module default
const errorHandler = {
  handleApiError,
  formatValidationErrors
};

export default errorHandler;
