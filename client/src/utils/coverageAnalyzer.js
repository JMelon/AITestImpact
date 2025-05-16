import axios from 'axios';

/**
 * Analyzes test coverage against requirements
 * @param {Object} params - Coverage analysis parameters
 * @param {Array} params.testCases - Generated test cases
 * @param {string} params.requirements - Original requirements (acceptance criteria/etc.)
 * @param {string} params.inputType - Type of input ('text', 'image', 'swagger')
 * @param {string} [params.apiToken] - OpenAI API token for analysis
 * @param {string} [params.modelName] - OpenAI model name to use
 * @returns {Promise<Object>} Coverage analysis results
 */
export const analyzeCoverage = async ({ testCases, requirements, inputType, apiToken, modelName }) => {
  try {
    // For local analysis (without AI):
    if (!apiToken || testCases.length === 0) {
      return performBasicCoverageAnalysis({ testCases, requirements, inputType });
    }
    
    // For AI-powered detailed analysis:
    // Format test cases for API consumption - handle different data structures
    let formattedTestCases;
    
    if (typeof testCases === 'string') {
      // Already a string, use as-is
      formattedTestCases = testCases;
    } else if (Array.isArray(testCases)) {
      // Process array of test case objects
      formattedTestCases = testCases.map(tc => {
        // If test case has content property, use that
        if (tc.content) return tc.content;
        
        // Otherwise try to create a readable format from the object
        if (tc.title) {
          let content = `Test Case: ${tc.title}\n`;
          if (tc.format === 'Procedural' && tc.structuredData) {
            content += `Objective: ${tc.structuredData.objective || 'N/A'}\n`;
            // Add steps if available
            if (tc.structuredData.steps && tc.structuredData.steps.length > 0) {
              content += "Steps:\n";
              tc.structuredData.steps.forEach((step, idx) => {
                content += `${idx + 1}. ${step.description}\n`;
              });
            }
          } else if (tc.format === 'Gherkin' && tc.structuredData) {
            // Add Gherkin format
            content += "Gherkin:\n";
            if (tc.structuredData.givenSteps) {
              tc.structuredData.givenSteps.forEach(step => content += `Given ${step}\n`);
            }
            if (tc.structuredData.whenSteps) {
              tc.structuredData.whenSteps.forEach(step => content += `When ${step}\n`);
            }
            if (tc.structuredData.thenSteps) {
              tc.structuredData.thenSteps.forEach(step => content += `Then ${step}\n`);
            }
          }
          return content;
        }
        
        // Last resort: stringify the object but exclude large nested objects
        return JSON.stringify({
          title: tc.title || 'Unknown Test Case',
          format: tc.format || 'Unknown Format',
          priority: tc.priority,
          severity: tc.severity,
          tags: tc.tags
        });
      }).join('\n\n');
    } else {
      // If none of the above, try to stringify the object
      try {
        formattedTestCases = JSON.stringify(testCases);
      } catch (e) {
        console.error('Failed to stringify test cases:', e);
        formattedTestCases = 'Unable to process test cases format';
      }
    }
    
    // Make sure requirements is a string
    const processedRequirements = typeof requirements === 'string' 
      ? requirements 
      : JSON.stringify(requirements);
    
    console.log('Sending coverage analysis request with type:', inputType);
    
    const response = await axios.post('http://localhost:5000/api/analyze-test-coverage', {
      testCases: formattedTestCases,
      requirements: processedRequirements,
      inputType
    }, {
      headers: {
        'X-OpenAI-Token': apiToken,
        'X-OpenAI-Model': modelName || 'gpt-4.1-2025-04-14'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing coverage:', error);
    return {
      coverageScore: null,
      coverageDetails: [],
      error: 'Failed to analyze coverage: ' + (error.response?.data?.error || error.message),
      missingAreas: [],
      needsAiAnalysis: true // Indicate that AI analysis is needed but failed
    };
  }
};

/**
 * Perform basic keyword/heuristic based coverage analysis without AI
 */
const performBasicCoverageAnalysis = ({ testCases, requirements, inputType }) => {
  if (inputType === 'text' && requirements) {
    // Extract key terms from requirements (simplified approach)
    const keyTerms = extractKeyTerms(requirements);
    
    // Check test cases for coverage of these terms
    const coveredTerms = new Set();
    const coverageDetails = [];
    
    testCases.forEach(testCase => {
      const content = testCase.content.toLowerCase();
      
      keyTerms.forEach(term => {
        if (content.includes(term.toLowerCase())) {
          coveredTerms.add(term);
          coverageDetails.push({
            term,
            covered: true,
            testCase: testCase.title
          });
        }
      });
    });
    
    // Calculate coverage score
    const coverageScore = keyTerms.length > 0 
      ? Math.round((coveredTerms.size / keyTerms.length) * 100) 
      : 0;
    
    // Identify missing areas
    const missingTerms = keyTerms.filter(term => !coveredTerms.has(term));
    
    return {
      coverageScore,
      coverageDetails,
      missingAreas: missingTerms.map(term => ({ term, type: 'keyword' }))
    };
  }
  
  // For image or swagger, we need AI analysis for proper coverage check
  // Just return a placeholder for now
  return {
    coverageScore: null,
    coverageDetails: [],
    missingAreas: [],
    needsAiAnalysis: true
  };
};

/**
 * Extract key terms from requirements
 * @param {string} requirements - The requirements text
 * @returns {Array<string>} Array of key terms
 */
const extractKeyTerms = (requirements) => {
  // Simple extraction - get nouns and important phrases
  const words = requirements.split(/\s+/);
  
  // Extract words that might be important (nouns, verbs)
  // This is a very simplified approach
  const significantWords = words.filter(word => 
    word.length > 4 && 
    !commonWords.includes(word.toLowerCase()) &&
    /^[a-zA-Z]+$/.test(word)
  );
  
  // Extract potential requirements phrases (simplified)
  let phrases = [];
  if (requirements.includes('should')) {
    const shouldPhrases = requirements
      .split(/\.|,|\n/)
      .filter(phrase => phrase.toLowerCase().includes('should'))
      .map(phrase => phrase.trim());
    phrases = [...phrases, ...shouldPhrases];
  }
  
  if (requirements.includes('must')) {
    const mustPhrases = requirements
      .split(/\.|,|\n/)
      .filter(phrase => phrase.toLowerCase().includes('must'))
      .map(phrase => phrase.trim());
    phrases = [...phrases, ...mustPhrases];
  }
  
  // Combine significant words and phrases
  return Array.from(new Set([...significantWords, ...phrases]));
};

// Common words to filter out
const commonWords = [
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'from', 'they', 'will', 'would', 'there', 'their', 'what', 'about',
  'which', 'when', 'make', 'like', 'time', 'just', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'other', 'than',
  'then', 'look', 'only', 'come', 'over', 'think', 'also'
];

const coverageAnalyzerUtils = {
  analyzeCoverage
};

export default coverageAnalyzerUtils;
