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
 * @param {Object} testCase - Structured Gherkin test case
 * @returns {String} Markdown formatted test case
 */
export const generateGherkinMarkdown = (testCase) => {
  // Start with just a clean code block - no header text
  let markdown = "```gherkin\n";
  
  // Add Feature and its description
  markdown += `Feature: ${testCase.feature || testCase.title}\n`;
  if (testCase.featureDescription) {
    markdown += `  ${testCase.featureDescription}\n`;
  }
  markdown += '\n';
  
  // Add Background if present
  if (testCase.background) {
    markdown += `Background:\n${testCase.background}\n\n`;
  }
  
  // Add tags at the scenario level, not feature level
  if (testCase.tags && testCase.tags.length > 0) {
    testCase.tags.forEach(tag => {
      // Make sure we only have one @ symbol per tag
      const cleanTag = tag.startsWith('@') ? tag : `@${tag}`;
      markdown += `${cleanTag} `;
    });
    markdown += '\n';
  }
  
  // Add Scenario
  markdown += `${testCase.scenarioType || 'Scenario'}: ${testCase.title}\n`;
  
  // Fix for handling steps with possible "And" or "But" prefixes
  const formatStep = (step, prefix) => {
    // First, remove the main prefix if already present
    let cleanStep = step;
    if (step.startsWith(`${prefix} `)) {
      cleanStep = step.substring(prefix.length + 1);
    }
    
    // Check if the step starts with "And" or "But"
    if (cleanStep.startsWith('And ') || cleanStep.startsWith('But ')) {
      // Keep the "And" or "But" as is, don't prepend the main prefix
      return `  ${cleanStep}`;
    } else {
      // Regular step, add proper prefix
      return `  ${prefix} ${cleanStep}`;
    }
  };
  
  // Add Given steps
  if (testCase.givenSteps && testCase.givenSteps.length > 0) {
    testCase.givenSteps.forEach(step => {
      if (step) {
        markdown += formatStep(step, 'Given') + '\n';
      }
    });
  }
  
  // Add When steps
  if (testCase.whenSteps && testCase.whenSteps.length > 0) {
    testCase.whenSteps.forEach(step => {
      if (step) {
        markdown += formatStep(step, 'When') + '\n';
      }
    });
  }
  
  // Add Then steps
  if (testCase.thenSteps && testCase.thenSteps.length > 0) {
    testCase.thenSteps.forEach(step => {
      if (step) {
        markdown += formatStep(step, 'Then') + '\n';
      }
    });
  }
  
  // Add Examples if present
  if (testCase.examples) {
    markdown += `\nExamples:\n${testCase.examples}\n`;
  }
  
  markdown += "\n```\n";
  
  return markdown;
};

const testCaseProcessorUtils = { 
  processStructuredTestCases,
  generateProceduralMarkdown,
  generateGherkinMarkdown
};

export default testCaseProcessorUtils;
