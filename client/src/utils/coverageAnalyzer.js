import axios from 'axios';

/**
 * Analyzes test coverage against requirements
 * @param {Object} params - Coverage analysis parameters
 * @param {Array} params.testCases - Generated test cases
 * @param {string} params.requirements - Original requirements (acceptance criteria/etc.)
 * @param {string} params.inputType - Type of input ('text', 'image', 'swagger')
 * @param {string} [params.apiToken] - OpenAI API token for analysis
 * @returns {Promise<Object>} Coverage analysis results
 */
export const analyzeCoverage = async ({ testCases, requirements, inputType, apiToken }) => {
  try {
    // For local analysis (without AI):
    if (!apiToken || testCases.length === 0) {
      return performBasicCoverageAnalysis({ testCases, requirements, inputType });
    }
    
    // For AI-powered detailed analysis:
    // Format test cases content for API consumption
    const formattedTestCases = testCases.map(tc => tc.content).join('\n\n');
    
    const response = await axios.post('http://localhost:5000/api/analyze-test-coverage', {
      testCases: formattedTestCases,
      requirements,
      inputType
    }, {
      headers: {
        'X-OpenAI-Token': apiToken
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing coverage:', error);
    return {
      coverageScore: null,
      coverageDetails: [],
      error: 'Failed to analyze coverage',
      missingAreas: []
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
