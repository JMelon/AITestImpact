const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const testCasesRoutes = require('./routes/testCases');

const app = express();

const DEFAULT_MODEL = 'gpt-4.1-2025-04-14';

// Helper function to handle OpenAI API errors
const handleOpenAIError = (error) => {
  // Check if it's a model not found error
  if (error.response?.data?.error?.code === 'model_not_found') {
    return {
      status: 400,
      error: 'Invalid AI model specified',
      details: `The model "${error.response.data.error.message.split("'")[1] || 'specified'}" does not exist or you don't have access to it. Please check your settings and try a different model like "${DEFAULT_MODEL}".`,
      code: 'model_not_found'
    };
  }
  
  // Other common OpenAI API errors
  if (error.response?.data?.error?.type === 'invalid_request_error') {
    return {
      status: 400,
      error: 'Invalid request to AI service',
      details: error.response.data.error.message,
      code: error.response.data.error.code
    };
  }
  
  if (error.response?.status === 429) {
    return {
      status: 429,
      error: 'Rate limit exceeded',
      details: 'You have exceeded the rate limit for the AI service. Please try again later.',
      code: 'rate_limit_exceeded'
    };
  }
  
  // Default error handling
  return {
    status: error.response?.status || 500,
    error: 'Error calling AI service',
    details: error.response?.data?.error?.message || error.message,
    code: error.response?.data?.error?.code || 'unknown_error'
  };
};

// Middleware
app.use(cors());

// Increase the payload size limit for JSON requests (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection - only if enabled in environment
const enableMongoDB = process.env.ENABLE_MONGODB === 'true';

if (enableMongoDB) {
  console.log('MongoDB integration enabled, attempting to connect...');
  
  // Configure MongoDB connection options with proper error handling
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    connectTimeoutMS: 10000, // Connection timeout after 10 seconds
  };
  
  mongoose.connect(process.env.MONGODB_URI, mongoOptions)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      if (err.name === 'MongoServerError' && err.code === 13) {
        console.error('Authentication failed. Please check your MongoDB username and password in .env file');
      } else if (err.name === 'MongoServerSelectionError') {
        console.error('Could not connect to MongoDB server. Please check if MongoDB is running');
      }
      console.log('Continuing without MongoDB functionality');
      console.log('To disable MongoDB connection attempts, set ENABLE_MONGODB=false in your .env file');
    });
} else {
  console.log('MongoDB integration disabled by configuration');
}

// Use test case routes if MongoDB is enabled
if (enableMongoDB) {
  app.use('/api/test-cases', testCasesRoutes);
} else {
  // Add a mock implementation for when MongoDB is disabled
  app.use('/api/test-cases', (req, res) => {
    if (req.path === '/stats') {
      return res.json({
        totalCount: 0,
        passedCount: 0,
        failedCount: 0,
        generationCount: 0,
        message: 'MongoDB not connected, showing placeholder data',
        timestamp: new Date()
      });
    }
    
    // Return empty array for GET requests to list endpoint
    if (req.method === 'GET' && req.path === '/') {
      return res.json([]);
    }
    
    // Return 501 Not Implemented for other endpoints when MongoDB is disabled
    res.status(501).json({ 
      error: 'MongoDB is disabled or authentication failed. Test case management features are not available.',
      details: 'Check MongoDB connection settings in your .env file'
    });
  });
}

// API route for generating test cases
app.post('/api/generate-test-cases', async (req, res) => {
  try {
    const { 
      acceptanceCriteria, 
      outputType, 
      language, 
      imageData,
      imageDataArray, 
      swaggerUrl,
      priority,
      severity,
      testType,
      extendedOptions
    } = req.body;
    
    if ((!acceptanceCriteria && !imageData && !imageDataArray && !swaggerUrl) || !outputType || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get API token and model from request header
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL; // Default if not provided
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    // Convert coverage option to tag-friendly format (remove spaces)
    const coverageTag = extendedOptions ? extendedOptions.replace(/\s+/g, '') : 'HappyPaths';

    // Add special instructions for Gherkin format
    let testConfigInfo = `
Testing Configuration:
- Priority: ${priority || 'P2-Medium'}
- Severity: ${severity || 'Major'}
- Test Type: ${testType || 'Functional'}
- Test Coverage: ${extendedOptions || 'Happy paths'}

IMPORTANT: You MUST follow these configuration parameters for ALL generated test cases. Each test case must:
1. Reflect the specified Priority level (${priority || 'P2-Medium'})
2. Match the indicated Severity (${severity || 'Major'})
3. Focus on the Test Type specified (${testType || 'Functional'})
4. Cover scenarios appropriate for the Test Coverage type (${extendedOptions || 'Happy paths'})

The generated test cases will be evaluated based on how well they adhere to these parameters.`;

    // Add Gherkin-specific instructions if outputType is Gherkin
    if (outputType === 'Gherkin') {
      testConfigInfo += `

For Gherkin format, please provide a COMPLETE feature file with proper structure, including:
1. Feature name and description at the top
2. Background section if applicable
3. Multiple scenarios with the following tags at the beginning of EACH scenario:
   @${priority || 'P2-Medium'} @${severity || 'Major'} @${testType || 'Functional'} @${coverageTag}

Example:
Feature: User Authentication
  As a user
  I want to be able to authenticate with the system
  So that I can access my account

  Background:
    Given the application is running
    And I am on the login page

  @P2-Medium @Major @Functional @HappyPaths
  Scenario: User successfully logs in with valid credentials
    When I enter valid username and password
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @P1-High @Critical @Security @NegativePaths
  Scenario: User cannot login with invalid credentials
    When I enter invalid username and password
    And I click the login button
    Then I should see an error message
    And I should remain on the login page

Please generate at least 4-6 complete scenarios covering different aspects of the functionality.`;
    }

    let messages = [];
    
    if (swaggerUrl) {
      // For Swagger-based test case generation
      try {
        // Fetch the Swagger JSON
        const swaggerResponse = await axios.get(swaggerUrl);
        const swaggerJson = JSON.stringify(swaggerResponse.data);
        
        messages = [
          {
            role: 'system',
            content: `You generate Test Cases based on Swagger/OpenAPI documentation. Analyze the API endpoints, their parameters, responses, and schemas to create comprehensive test cases. Focus on functional tests, edge cases, error handling, and data validation. ${testConfigInfo} It is really important that you do not use Gherkin if the user asked for Procedural. For Procedural format, use this exact template:\n\n**Test Case ID:** TC-API-XXX  \n**Title:** <Short, descriptive name>  \n**Objective:** <What you\'re verifying>  \n**Preconditions:**  \n- <Any setup or state required before you begin>  \n\n**Steps:**\n1) <Step description>\n2) <Step description>\n3) <...>\n\n**Expected Results:**\n- <Expected result for step 1>\n- <Expected result for step 2>\n- <...>\n\n**Postconditions:**  \n- <Any cleanup or state left after the test>\n\n---\n\nBut if the user chooses Gherkin, then write it in Gherkin (using Given, When, Then).`
          },
          {
            role: 'user',
            content: `Generate test cases in ${outputType} format for the API defined in the following Swagger/OpenAPI documentation: ${swaggerJson}. Use language: ${language}.`
          }
        ];
      } catch (error) {
        return res.status(400).json({ error: 'Failed to fetch Swagger JSON from provided URL' });
      }
    } else if (imageDataArray && imageDataArray.length > 0) {
      // For multiple images test case generation
      const imageContentItems = imageDataArray.map((img, index) => ({
        type: 'image_url',
        image_url: {
          url: img,
        }
      }));
      
      messages = [
        {
          role: 'system',
          content: 'You generate Test Cases based on UI screenshots. Analyze the multiple images to identify UI elements, features, and user workflow across different screens. Then generate comprehensive test cases that cover the entire user journey shown across these screens. It is really important that you do not use Gherkin if the user asked for Procedural, even if the UI suggests BDD. For Procedural format, use this exact template:\n\n**Test Case ID:** TC-UI-XXX  \n**Title:** <Short, descriptive name>  \n**Objective:** <What you\'re verifying>  \n**Preconditions:**  \n- <Any setup or state required before you begin>  \n\n**Steps:**\n1) <Step description>\n2) <Step description>\n3) <...>\n\n**Expected Results:**\n- <Expected result for step 1>\n- <Expected result for step 2>\n- <...>\n\n**Postconditions:**  \n- <Any cleanup or state left after the test>\n\n---\n\nBut if the user chooses Gherkin, then write it in Gherkin (using Given, When, Then).'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate test cases in ${outputType} format for the UI shown in the ${imageDataArray.length} attached images. These images represent different screens or states of the application. Create tests that cover the workflow across these screens. Use language: ${language}. ${testConfigInfo}`
            },
            ...imageContentItems
          ]
        }
      ];
    } else if (imageData) {
      // For single image test case generation (keeping for backward compatibility)
      messages = [
        {
          role: 'system',
          content: `You generate Test Cases based on UI screenshots. Analyze the image to identify UI elements, features, and potential user interactions. Then generate comprehensive test cases. ${testConfigInfo} It is really important that you do not use Gherkin if the user asked for Procedural, even if the UI suggests BDD. For Procedural format, use this exact template:\n\n**Test Case ID:** TC-UI-XXX  \n**Title:** <Short, descriptive name>  \n**Objective:** <What you\'re verifying>  \n**Preconditions:**  \n- <Any setup or state required before you begin>  \n\n**Steps:**\n1) <Step description>\n2) <Step description>\n3) <...>\n\n**Expected Results:**\n- <Expected result for step 1>\n- <Expected result for step 2>\n- <...>\n\n**Postconditions:**  \n- <Any cleanup or state left after the test>\n\n---\n\nBut if the user chooses Gherkin, then write it in Gherkin (using Given, When, Then).`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate test cases in ${outputType} format for the UI shown in the attached image. Use language: ${language}.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData,
              }
            }
          ]
        }
      ];
    } else {
      // For text-based test case generation
      messages = [
        {
          role: 'system',
          content: `You generate Test Cases. ${testConfigInfo} It is really important that you do not use Gherkin if the user asked for Procedural, even if the Acceptance Criteria is in Gherkin. For Procedural format, use this exact template:\n\n**Test Case ID:** TC-FUNC-XXX  \n**Title:** <Short, descriptive name>  \n**Objective:** <What you\'re verifying>  \n**Preconditions:**  \n- <Any setup or state required before you begin>  \n\n**Steps:**\n1) <Step description>\n2) <Step description>\n3) <...>\n\n**Expected Results:**\n- <Expected result for step 1>\n- <Expected result for step 2>\n- <...>\n\n**Postconditions:**  \n- <Any cleanup or state left after the test>\n\n---\n\nBut if the user chooses Gherkin, then write it in Gherkin (using Given, When, Then).`
        },
        {
          role: 'user',
          content: `Generate test cases in ${outputType} format for the following acceptance criteria: "${acceptanceCriteria}". Use language: ${language}.`
        }
      ];
    }

    // Create a system prompt that asks for structured JSON response
    const structuredTestCasePrompt = `You generate Test Cases based on ${acceptanceCriteria ? 'acceptance criteria' : imageData || imageDataArray ? 'UI screenshots' : swaggerUrl ? 'Swagger/OpenAPI documentation' : 'requirements'}. 
    
Instead of returning test cases as plain text, you MUST return a structured JSON object containing an array of test cases with the following schema:

{
  "testCases": [
    // For Procedural Test Cases
    {
      "format": "Procedural",
      "testId": "TC-XXX-001",  // IMPORTANT: Each test case MUST have a unique ID with sequential numbering (001, 002, 003, etc.)
      "title": "Test case title",
      "objective": "What the test is verifying",
      "preconditions": [
        "Precondition 1",
        "Precondition 2"
      ],
      "steps": [
        {
          "number": 1,
          "description": "Step description",
          "expectedResult": "Expected result for this step"
        },
        // More steps...
      ],
      "postconditions": [
        "Postcondition 1",
        "Postcondition 2"
      ],
      "priority": "${priority || 'P2-Medium'}", // MUST match user-specified priority
      "severity": "${severity || 'Major'}", // MUST match user-specified severity
      "category": "${swaggerUrl ? 'API' : imageData || imageDataArray ? 'UI' : 'Other'}",
      "tags": ["${testType || 'Functional'}", "${extendedOptions || 'Happy paths'}"] // MUST include specified test type and coverage
    },
    // For Gherkin Test Cases
    {
      "format": "Gherkin",
      "title": "Scenario title",
      "feature": "Feature name",
      "featureDescription": "Feature description",
      "background": "Background steps (if any)",
      "scenarioType": "Scenario or Scenario Outline",
      "givenSteps": [
        "Given step 1",
        "And step 2"
      ],
      "whenSteps": [
        "When step 1",
        "And step 2"
      ],
      "thenSteps": [
        "Then step 1",
        "And step 2"
      ],
      "examples": "Examples table for scenario outlines",
      "tags": ["@tag1", "@tag2"],
      "priority": "${priority || 'P2-Medium'}",
      "severity": "${severity || 'Major'}",
      "category": "${swaggerUrl ? 'API' : imageData ? 'UI' : 'Other'}"
    }
  ],
  "summary": {
    "totalTestCases": 5,
    "coverage": "Description of test coverage",
    "recommendations": "Any recommendations for additional testing"
  }
}

IMPORTANT: Ensure each test case has a unique testId. For procedural test cases, use the format 'TC-XXX-001', 'TC-XXX-002', etc., with sequential numbering. Never reuse the same number for multiple test cases.

You MUST return ONLY the JSON object, with no additional text before or after. The JSON must be properly formatted and valid.`;

    // Replace the original system prompt with our structured JSON prompt
    if (messages.length > 0 && messages[0].role === 'system') {
      messages[0].content += '\n\n' + structuredTestCasePrompt;
    }

    // Add a format instruction to the user message
    if (messages.length > 1 && messages[1].role === 'user') {
      messages[1].content += '\n\nPlease return the test cases in the structured JSON format as specified.';
    }

    console.log('Sending request to OpenAI API...');
    console.log('Using model:', modelName);
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelName,
      messages: messages,
      response_format: { type: "json_object" }, // Request JSON format explicitly
      temperature: 0.7,
      max_tokens: 4000,
    }, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    // Add detailed logging of the OpenAI response
    console.log('OpenAI API Response Status:', response.status);
    console.log('OpenAI Response Headers:', response.headers);
    
    // Process and return the structured response
    let responseData = response.data;
    
    // Check for duplicate testIds and fix them if needed
    if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
      try {
        let content = responseData.choices[0].message.content;
        let jsonData = typeof content === 'string' ? JSON.parse(content) : content;
        
        if (jsonData.testCases && Array.isArray(jsonData.testCases)) {
          // Fix duplicate IDs if they exist
          const usedIds = new Set();
          let needsRetry = false;
          
          jsonData.testCases.forEach((tc, index) => {
            if (tc.testId && usedIds.has(tc.testId)) {
              console.log(`Duplicate test ID detected: ${tc.testId}`);
              needsRetry = true;
            }
            usedIds.add(tc.testId);
          });
          
          if (needsRetry) {
            console.log("Detected duplicate test case IDs. Requesting a fix from OpenAI...");
            
            // Make a follow-up request to fix the numbering
            const fixResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: modelName, // Use the same model here
              messages: [
                {
                  role: 'system',
                  content: 'You are tasked with fixing the numbering of test cases. Each test case must have a unique testId.'
                },
                {
                  role: 'user',
                  content: `The following JSON contains test cases with duplicate IDs. Please fix the numbering to ensure each test case has a unique sequential ID (001, 002, 003, etc.):
                  
${JSON.stringify(jsonData, null, 2)}

Return only the fixed JSON object with no additional text.`
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.7,
            }, {
              headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            // Replace the original response data with the fixed data
            responseData = fixResponse.data;
          }
        }
      } catch (err) {
        console.error("Error processing or fixing test case IDs:", err);
      }
    }
    
    return res.json(responseData);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    const errorResponse = handleOpenAIError(error);
    return res.status(errorResponse.status).json(errorResponse);
  }
});

// API route for analyzing test coverage
app.post('/api/analyze-test-coverage', async (req, res) => {
  try {
    const { 
      testCases, 
      requirements, 
      inputType, 
      swaggerUrl, 
      imageDataArray 
    } = req.body;
    
    // Validate required inputs with better error messages
    if (!testCases) {
      return res.status(400).json({ 
        error: 'Test cases are required',
        details: 'Please provide test cases to analyze'
      });
    }

    // API token and model from request header
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL;
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    // Format prompt based on input type
    let prompt = '';
    
    if (inputType === 'text') {
      // For text input, check for requirements but don't fail - create a generic prompt if missing
      prompt = `
Please analyze if these test cases provide complete coverage for the given requirements and return your analysis as a JSON object.

${requirements ? `REQUIREMENTS:\n${requirements}` : 'REQUIREMENTS: (Not provided - please analyze test cases for general coverage quality)'}

TEST CASES:
${testCases}

Perform a detailed gap analysis to identify any areas of the requirements that are not adequately covered by the test cases. 
Provide a comprehensive evaluation of:
1. Overall coverage percentage (0-100%)
2. Specific requirements that are well-covered
3. Specific requirements that are partially covered or missing coverage
4. Recommendations for additional test cases to improve coverage

Return your analysis as a JSON object with the following structure:
{
  "coverageScore": number,
  "missingAreas": [{"description": string, "importance": "high"|"medium"|"low"}],
  "coverageDetails": [{"area": string, "covered": boolean, "testCases": string[]}],
  "suggestions": string[],
  "analysis": string
}

The analysis should be structured with clear sections and specific examples.
`;
    } else if (inputType === 'swagger') {
      // ...existing swagger code...
    } else if (inputType === 'image') {
      // ...existing image code...
    } else {
      // Default to basic text analysis if input type is not recognized
      prompt = `
Please analyze these test cases for quality and coverage and return your analysis as a JSON object:

TEST CASES:
${testCases}

Analyze the test cases for:
1. Overall quality (0-100%)
2. Areas that are well-covered
3. Potential gaps or missing edge cases
4. Recommendations for improvements

Return your analysis as a JSON object with the following structure:
{
  "coverageScore": number,
  "missingAreas": [{"description": string, "importance": "high"|"medium"|"low"}],
  "coverageDetails": [{"area": string, "covered": boolean, "testCases": string[]}],
  "suggestions": string[],
  "analysis": string
}
`;
    }

    // For text inputs, use JSON response format
    if (inputType === 'text' || inputType === 'swagger' || !inputType) {
      // Add handling for large inputs by limiting the size
      const maxChars = 14000; // Reasonable limit for inputs
      const trimmedTestCases = testCases.length > maxChars 
        ? testCases.substring(0, maxChars) + "... (content truncated for processing)"
        : testCases;
        
      const trimmedRequirements = requirements && requirements.length > maxChars
        ? requirements.substring(0, maxChars) + "... (content truncated for processing)"
        : requirements;
        
      const messages = [
        {
          role: 'system',
          content: 'You are a test coverage analyzer that examines if test cases adequately cover requirements or API specifications. Provide a structured analysis with numerical metrics and actionable recommendations. Your response should be formatted as a JSON object.'
        },
        {
          role: 'user',
          content: prompt.replace(testCases, trimmedTestCases)
                         .replace(requirements, trimmedRequirements || '')
        }
      ];

      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: modelName,
          messages: messages,
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4000,
        }, {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // Increase timeout to 60 seconds
        });
    
        // Extract the JSON content
        try {
          const content = response.data.choices[0].message.content;
          const jsonData = JSON.parse(content);
          
          // Ensure the response has the expected structure
          const formattedResponse = {
            coverageScore: jsonData.coverageScore || jsonData.coverage || 0,
            missingAreas: jsonData.missingAreas || jsonData.gaps || [],
            coverageDetails: jsonData.coverageDetails || jsonData.coveredAreas || [],
            suggestions: jsonData.suggestions || jsonData.recommendations || [],
            analysis: jsonData.analysis || jsonData.detailedAnalysis || ''
          };
          
          return res.json(formattedResponse);
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          
          // If JSON parsing fails, return the raw content with best-effort extraction
          const content = response.data.choices[0].message.content;
          return res.json({
            analysis: content,
            coverageScore: extractCoverageScore(content),
            missingAreas: extractMissingAreas(content),
            suggestions: extractSuggestions(content)
          });
        }
      } catch (openaiError) {
        // Specific handling for OpenAI API errors
        console.error('OpenAI API error:', openaiError.message);
        
        return res.status(500).json({
          error: 'Error calling AI service for coverage analysis',
          details: openaiError.message,
          coverageScore: null,
          missingAreas: [],
          suggestions: ['Try a smaller input or simpler requirements']
        });
      }
    }

    // ...existing code for image input...

  } catch (error) {
    console.error('Error analyzing test coverage:', error.response?.data || error.message);
    
    // Improve error response with more details
    const errorResponse = {
      status: error.response?.status || 500,
      error: 'Error analyzing test coverage',
      details: error.response?.data?.error || error.message || 'Unknown server error',
      code: error.response?.data?.code || 'server_error',
      coverageScore: null,
      missingAreas: [],
      suggestions: ['Try again with a simpler input']
    };
    
    return res.status(errorResponse.status).json(errorResponse);
  }
});

// Helper functions for extracting data from text responses
function extractCoverageScore(text) {
  // Try to find percentage patterns like "75%" or "coverage: 80"
  const percentageMatch = text.match(/(\d{1,3})%/);
  if (percentageMatch) return parseInt(percentageMatch[1]);
  
  const coverageMatch = text.match(/coverage[:\s]+(\d{1,3})/i);
  if (coverageMatch) return parseInt(coverageMatch[1]);
  
  return null;
}

function extractMissingAreas(text) {
  const missingAreas = [];
  
  // Look for sections that might indicate missing coverage
  const sections = text.split(/#+\s+/);
  
  for (const section of sections) {
    if (/missing|gap|not covered|lacking/i.test(section)) {
      // Extract bullet points
      const bullets = section.split(/\n-\s+/).slice(1);
      bullets.forEach(bullet => {
        if (bullet.trim()) {
          missingAreas.push({
            description: bullet.trim(),
            importance: determinImportance(bullet)
          });
        }
      });
    }
  }
  
  return missingAreas;
}

function determinImportance(text) {
  if (/critical|severe|high priority|crucial|essential/i.test(text)) {
    return 'high';
  } else if (/moderate|medium|important/i.test(text)) {
    return 'medium';
  } else {
    return 'low';
  }
}

function extractSuggestions(text) {
  const suggestions = [];
  
  // Look for recommendation sections
  const sections = text.split(/#+\s+/);
  
  for (const section of sections) {
    if (/recommend|suggestion|improve|enhance/i.test(section)) {
      // Extract bullet points
      const bullets = section.split(/\n-\s+/).slice(1);
      bullets.forEach(bullet => {
        if (bullet.trim()) {
          suggestions.push(bullet.trim());
        }
      });
    }
  }
  
  return suggestions;
}

// API route for quality assessment
app.post('/api/generate-quality-assessment', async (req, res) => {
  try {
    const { selectedPractices } = req.body;
    
    if (!selectedPractices) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get API token and model from request header
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL; // Default if not provided
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    const unselectedPractices = getUnselectedPractices(selectedPractices);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelName, // Use the model from the header
      messages: [
        {
          role: 'system',
          content: 'You are an expert software quality consultant. Analyze the provided software quality practices to create a tailored assessment report. Include strengths in the selected practices, identify gaps from unselected practices, and provide 3-5 specific, actionable recommendations to improve the quality posture. Format your response with clear sections for Strengths, Gaps, and Recommendations. Be concise but insightful.'
        },
        {
          role: 'user',
          content: `Generate a quality assessment based on these selected practices: ${JSON.stringify(selectedPractices)} and these unselected practices: ${JSON.stringify(unselectedPractices)}.`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    const errorResponse = handleOpenAIError(error);
    return res.status(errorResponse.status).json(errorResponse);
  }
});

// API route for test automation code generation
app.post('/api/generate-test-code', async (req, res) => {
  try {
    const { testCase, framework } = req.body;
    
    if (!testCase || !framework) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get API token and model from request header
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL; // Default if not provided
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelName, // Use the model from the header
      messages: [
        {
          role: 'system',
          content: 'You are an expert test automation engineer. Generate test automation code based on the provided test case and the selected automation framework. Use placeholder comments like "// insert_element_selector_here" or similar notation appropriate for the language whenever a selector for an element is needed. Include comments to explain the code structure and any setup requirements. Format the response as valid, runnable code with proper syntax highlighting. Include setup instructions if needed.'
        },
        {
          role: 'user',
          content: `Generate test automation code for the following test case using ${framework}: "${testCase}"`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    const errorResponse = handleOpenAIError(error);
    return res.status(errorResponse.status).json(errorResponse);
  }
});

// API route for refining test cases
app.post('/api/refine-test-cases', async (req, res) => {
  try {
    const { testCases, outputType, language } = req.body;
    
    if (!testCases || !outputType || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get API token and model from request header
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL; // Default if not provided
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert test engineer that improves existing test cases. Your task is to refine the given test cases by making them more comprehensive, finding edge cases that were missed, improving clarity, and ensuring complete coverage. Keep the same format as the original test cases. For Gherkin format, maintain the proper structure with Feature, Scenario, and steps. For Procedural format, ensure each test case has a clear ID, objective, preconditions, steps, and expected results.'
      },
      {
        role: 'user',
        content: `Please refine and improve the following ${outputType} test cases in ${language}. Make them more comprehensive, identify edge cases, improve clarity, and ensure complete coverage while maintaining the same format:\n\n${testCases}`
      }
    ];

    // Add structured JSON requirement to the system message
    if (messages.length > 0 && messages[0].role === 'system') {
      messages[0].content += '\n\nYou MUST return your response as a structured JSON object with the same schema as the input test cases.';
    }

    // Add a format instruction to the user message
    if (messages.length > 1 && messages[1].role === 'user') {
      messages[1].content += '\n\nPlease return the refined test cases in structured JSON format.';
    }

    console.log('Sending request to OpenAI API for test case refinement...');
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelName, // Use the model from the header
      messages: messages,
      response_format: { type: "json_object" }, // Request JSON format explicitly
      temperature: 0.7,
      max_tokens: 4000,
    }, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    const errorResponse = handleOpenAIError(error);
    return res.status(errorResponse.status).json(errorResponse);
  }
});

// API route for reviewing requirements
app.post('/api/review-requirements', async (req, res) => {
  try {
    const { requirements } = req.body;
    
    if (!requirements) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get API token and model from request header
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL; // Default if not provided
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    // Always use comprehensive analysis with all focus areas
    const systemPrompt = `You are an expert requirements analyst. Review the provided requirements for:

- Contradictions and inconsistencies
- Security vulnerabilities and concerns 
- Performance implications and bottlenecks
- Ambiguities and unclear specifications
- Missing requirements and edge cases
- Testability issues
- Implementation challenges
- Contextual misalignments with industry standards
- Compliance considerations

Provide a structured analysis with clear categories of findings, specific references to the requirements, and recommendations for improvement. Format your response in Markdown with sections and bullet points for clarity.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Please review these requirements and provide analysis:\n\n${requirements}`
      }
    ];

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelName, // Use the model from the header
      messages: messages
    }, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    const errorResponse = handleOpenAIError(error);
    return res.status(errorResponse.status).json(errorResponse);
  }
});

// Helper function to determine unselected practices
function getUnselectedPractices(selectedPractices) {
  const allPractices = [
    "Unit tests", "Integration tests", "Contract tests", "End-to-end tests", 
    "Exploratory testing", "Automated regression tests", "Load testing", 
    "Stress testing", "Performance testing", "Security testing", 
    "Static code analysis", "Dynamic code analysis", "Code reviews", 
    "Pair programming", "TDD (Test-Driven Development)", 
    "BDD (Behavior-Driven Development)", "CI (Continuous Integration)", 
    "CD (Continuous Delivery)", "Quality gates in pipelines", "Linting tools", 
    "Code coverage tracking", "Feature flags", "Monitoring in production", 
    "Observability tools", "Logging strategy", "Alerting strategy", 
    "Rollback strategy", "Canary releases", "Blue/Green deployments", 
    "Infrastructure as Code", "Containerization (e.g., Docker)", 
    "Orchestration (e.g., Kubernetes)", "Automated test environments", 
    "Synthetic testing", "Chaos engineering", "Risk-based testing", 
    "Flaky test management", "Test data management", "Accessibility testing", 
    "Cross-browser testing", "Mobile testing", "Quality coaching", 
    "QA in planning/refinement sessions", "Shift-left testing", 
    "Shift-right testing", "Bug tracking system", "Root cause analysis practices", 
    "Definition of Done includes quality criteria", "Clean code practices", 
    "Technical debt management", "Security audits", 
    "Dependency vulnerability scanning", "Privacy by design", 
    "Ethical considerations in software", "Compliance testing", 
    "Documentation for testing strategies", "Test reporting dashboards", 
    "Test case versioning", "Manual test scripts maintained", 
    "Automated test reports", "Dedicated QA environments", 
    "Continuous testing strategy", "Quality KPIs tracked", 
    "Regression suite execution in pipelines", "AI-based test automation", 
    "Visual testing", "Smoke tests", "Sanity checks", 
    "Test tagging and filtering", "Test parallelization", 
    "Developer ownership of quality"
  ];
  
  return allPractices.filter(practice => !selectedPractices.includes(practice));
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
