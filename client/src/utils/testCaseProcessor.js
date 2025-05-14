/**
 * Process structured test case JSON from the API response
 */

/**
 * Process structured test case data from API response
 * @param {Object} response - The API response containing structured test cases
 * @returns {Array} Array of processed test cases ready for display and storage
 */
export const processStructuredTestCases = (response) => {
  // Extract the JSON content from the API response
  try {
    let testCasesData;
    
    // Handle different response formats
    if (response.choices && response.choices[0] && response.choices[0].message) {
      // Try to parse the content as JSON if it's a string
      const content = response.choices[0].message.content;
      try {
        testCasesData = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (e) {
        console.error('Failed to parse JSON from response content', e);
        return []; // Return empty array if parsing fails
      }
    } else if (response.testCases) {
      // If the response already has a testCases field
      testCasesData = response;
    } else {
      console.error('Unexpected response format', response);
      return []; // Return empty array for unexpected format
    }
    
    // Process the test cases
    const processedTestCases = [];
    
    if (testCasesData.testCases && Array.isArray(testCasesData.testCases)) {
      testCasesData.testCases.forEach((tc, index) => {
        // Generate markdown content based on the structure
        let markdownContent = '';
        let id = tc.testId || `TC-${index + 1}`;
        
        if (tc.format === 'Procedural') {
          markdownContent = generateProceduralMarkdown(tc);
        } else if (tc.format === 'Gherkin') {
          markdownContent = generateGherkinMarkdown(tc);
        }
        
        // Create a processed test case object
        processedTestCases.push({
          id,
          title: tc.title,
          content: markdownContent,
          structuredData: tc,
          format: tc.format,
          priority: tc.priority,
          severity: tc.severity,
          category: tc.category,
          tags: tc.tags || []
        });
      });
    }
    
    return processedTestCases;
  } catch (error) {
    console.error('Error processing structured test cases', error);
    return [];
  }
};

/**
 * Generate markdown content from procedural test case structure
 * @param {Object} tc - Structured procedural test case
 * @returns {String} Markdown formatted test case
 */
export const generateProceduralMarkdown = (tc) => {
  let markdown = `**Test Case ID:** ${tc.testId}\n`;
  markdown += `**Title:** ${tc.title}\n`;
  markdown += `**Objective:** ${tc.objective}\n\n`;
  
  if (tc.preconditions && tc.preconditions.length > 0) {
    markdown += `**Preconditions:**\n`;
    tc.preconditions.forEach(pre => {
      markdown += `- ${pre}\n`;
    });
    markdown += '\n';
  }
  
  if (tc.steps && tc.steps.length > 0) {
    markdown += `**Steps:**\n`;
    tc.steps.forEach(step => {
      markdown += `${step.number}) ${step.description}\n`;
    });
    markdown += '\n';
    
    markdown += `**Expected Results:**\n`;
    tc.steps.forEach(step => {
      if (step.expectedResult) {
        markdown += `- ${step.expectedResult}\n`;
      }
    });
    markdown += '\n';
  }
  
  if (tc.postconditions && tc.postconditions.length > 0) {
    markdown += `**Postconditions:**\n`;
    tc.postconditions.forEach(post => {
      markdown += `- ${post}\n`;
    });
  }
  
  return markdown;
};

/**
 * Generate markdown content from Gherkin test case structure
 * @param {Object} tc - Structured Gherkin test case
 * @returns {String} Markdown formatted test case
 */
export const generateGherkinMarkdown = (tc) => {
  let markdown = `Feature: ${tc.feature}\n`;
  
  if (tc.featureDescription) {
    markdown += `${tc.featureDescription}\n\n`;
  }
  
  if (tc.background) {
    markdown += `Background:\n${tc.background}\n\n`;
  }
  
  if (tc.tags && tc.tags.length > 0) {
    markdown += `${tc.tags.join(' ')}\n`;
  }
  
  markdown += `${tc.scenarioType || 'Scenario'}: ${tc.title}\n`;
  
  if (tc.givenSteps && tc.givenSteps.length > 0) {
    tc.givenSteps.forEach((step, i) => {
      markdown += i === 0 ? `  Given ${step}\n` : `  And ${step}\n`;
    });
  }
  
  if (tc.whenSteps && tc.whenSteps.length > 0) {
    tc.whenSteps.forEach((step, i) => {
      markdown += i === 0 ? `  When ${step}\n` : `  And ${step}\n`;
    });
  }
  
  if (tc.thenSteps && tc.thenSteps.length > 0) {
    tc.thenSteps.forEach((step, i) => {
      markdown += i === 0 ? `  Then ${step}\n` : `  And ${step}\n`;
    });
  }
  
  if (tc.examples) {
    markdown += `\nExamples:\n${tc.examples}\n`;
  }
  
  return markdown;
};

const testCaseProcessorUtils = { 
  processStructuredTestCases,
  generateProceduralMarkdown,
  generateGherkinMarkdown
};

export default testCaseProcessorUtils;
