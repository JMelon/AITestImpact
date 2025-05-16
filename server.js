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
    
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL;
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    let messages = [];
    // --- FIX: Always use explicit JSON schema and prompt for all input types ---
    if (swaggerUrl) {
      // Swagger/OpenAPI input
      try {
        const swaggerResponse = await axios.get(swaggerUrl);
        const swaggerJson = JSON.stringify(swaggerResponse.data);

        let systemPrompt = `
You are an expert test engineer. Analyze the provided Swagger/OpenAPI JSON and generate comprehensive test cases for all endpoints, parameters, and responses.
- If "Procedural" is selected, return test cases in the specified procedural JSON schema.
- If "Gherkin" is selected, return test cases in the specified Gherkin JSON schema (see below).
- Use the configuration: Priority: ${priority || 'P2-Medium'}, Severity: ${severity || 'Major'}, Test Type: ${testType || 'Functional'}, Test Coverage: ${extendedOptions || 'Happy paths'}.
- Return ONLY a valid JSON object as described below, with no extra text.

Gherkin JSON schema example:
{
  "testCases": [
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
      "category": "API"
    }
  ]
}

Procedural JSON schema example:
{
  "testCases": [
    {
      "format": "Procedural",
      "testId": "TC-API-001",
      "title": "Test case title",
      "objective": "What the test is verifying",
      "preconditions": ["Precondition 1"],
      "steps": [
        { "number": 1, "description": "Step description", "expectedResult": "Expected result" }
      ],
      "postconditions": ["Postcondition 1"],
      "priority": "${priority || 'P2-Medium'}",
      "severity": "${severity || 'Major'}",
      "category": "API",
      "tags": ["${testType || 'Functional'}", "${extendedOptions || 'Happy paths'}"]
    }
  ]
}

Return only the JSON object, with no extra text.
        `.trim();

        messages = [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate ${outputType} test cases for the API defined in the following Swagger/OpenAPI documentation: ${swaggerJson}. Use language: ${language}.`
          }
        ];
      } catch (error) {
        return res.status(400).json({ error: 'Failed to fetch Swagger JSON from provided URL' });
      }
    } else if (imageDataArray && imageDataArray.length > 0) {
      const imageContentItems = imageDataArray.map((img, index) => ({
        type: 'image_url',
        image_url: { url: img }
      }));

      let systemPrompt = `
You are an expert test engineer. Analyze the attached UI screenshots (multiple images) and generate comprehensive test cases that cover all visible features, workflows, and edge cases. 
- If "Procedural" is selected, return test cases in the specified procedural JSON schema.
- If "Gherkin" is selected, return test cases in the specified Gherkin JSON schema (see below).
- Each test case must be based on what is visible in the images and should not invent features not present in the UI.
- Use the configuration: Priority: ${priority || 'P2-Medium'}, Severity: ${severity || 'Major'}, Test Type: ${testType || 'Functional'}, Test Coverage: ${extendedOptions || 'Happy paths'}.
- Return ONLY a valid JSON object as described below, with no extra text.

Gherkin JSON schema example:
{
  "testCases": [
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
      "category": "UI"
    }
  ]
}

Procedural JSON schema example:
{
  "testCases": [
    {
      "format": "Procedural",
      "testId": "TC-UI-001",
      "title": "Test case title",
      "objective": "What the test is verifying",
      "preconditions": ["Precondition 1"],
      "steps": [
        { "number": 1, "description": "Step description", "expectedResult": "Expected result" }
      ],
      "postconditions": ["Postcondition 1"],
      "priority": "${priority || 'P2-Medium'}",
      "severity": "${severity || 'Major'}",
      "category": "UI",
      "tags": ["${testType || 'Functional'}", "${extendedOptions || 'Happy paths'}"]
    }
  ]
}

Return only the JSON object, with no extra text.
      `.trim();

      messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Generate ${outputType} test cases for the UI shown in the attached images.`
            },
            ...imageContentItems
          ]
        }
      ];
    } else if (imageData) {
      messages = [
        {
          role: 'system',
          content: `You generate Test Cases based on UI screenshots. Analyze the image to identify UI elements, features, and potential user interactions. Then generate comprehensive test cases.`
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
              image_url: { url: imageData }
            }
          ]
        }
      ];
    } else if (acceptanceCriteria) {
      // --- FIX: Add explicit JSON schema and prompt for text input ---
      let systemPrompt = `
You are an expert test engineer. Analyze the provided acceptance criteria and generate comprehensive test cases.
- If "Procedural" is selected, return test cases in the specified procedural JSON schema.
- If "Gherkin" is selected, return test cases in the specified Gherkin JSON schema (see below).
- Use the configuration: Priority: ${priority || 'P2-Medium'}, Severity: ${severity || 'Major'}, Test Type: ${testType || 'Functional'}, Test Coverage: ${extendedOptions || 'Happy paths'}.
- Return ONLY a valid JSON object as described below, with no extra text.

Gherkin JSON schema example:
{
  "testCases": [
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
      "category": "Functional"
    }
  ]
}

Procedural JSON schema example:
{
  "testCases": [
    {
      "format": "Procedural",
      "testId": "TC-FUNC-001",
      "title": "Test case title",
      "objective": "What the test is verifying",
      "preconditions": ["Precondition 1"],
      "steps": [
        { "number": 1, "description": "Step description", "expectedResult": "Expected result" }
      ],
      "postconditions": ["Postcondition 1"],
      "priority": "${priority || 'P2-Medium'}",
      "severity": "${severity || 'Major'}",
      "category": "Functional",
      "tags": ["${testType || 'Functional'}", "${extendedOptions || 'Happy paths'}"]
    }
  ]
}

Return only the JSON object, with no extra text.
      `.trim();

      messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Generate ${outputType} test cases for the following acceptance criteria: "${acceptanceCriteria}". Use language: ${language}.`
        }
      ];
    } else {
      return res.status(400).json({ error: 'Invalid input for test case generation' });
    }

    // ...existing code for adding JSON object instruction if not present...
    if (messages.length > 0 && messages[0].role === 'system' && !messages[0].content.includes('Return ONLY a valid JSON object')) {
      messages[0].content += `
Return ONLY a valid JSON object as described above, with no extra text.`;
    }

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
      timeout: 60000
    });

    let responseData = response.data;
    if (responseData.choices && responseData.choices[0] && responseData.choices[0].message) {
      try {
        let content = responseData.choices[0].message.content;
        let jsonData = typeof content === 'string' ? JSON.parse(content) : content;
        responseData = { ...responseData, ...jsonData };
      } catch (err) {
        responseData = { ...responseData, rawContent: responseData.choices[0].message.content };
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
    
    if (!testCases) {
      return res.status(400).json({ 
        error: 'Test cases are required',
        details: 'Please provide test cases to analyze'
      });
    }

    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL;
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    let prompt = '';

    if (inputType === 'text') {
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
      if (!swaggerUrl) {
        return res.status(400).json({ error: 'Swagger URL is required for swagger input type' });
      }
      try {
        const swaggerResponse = await axios.get(swaggerUrl);
        const swaggerJson = JSON.stringify(swaggerResponse.data);

        prompt = `
You are a test coverage analyzer. Analyze the following Swagger/OpenAPI specification and the provided test cases to determine coverage.
- Identify which endpoints, parameters, and responses are covered by the test cases.
- Identify any endpoints or scenarios that are not covered.
- Return your analysis as a JSON object with the following structure:
{
  "coverageScore": number,
  "missingAreas": [{"description": string, "importance": "high"|"medium"|"low"}],
  "coverageDetails": [{"area": string, "covered": boolean, "testCases": string[]}],
  "suggestions": string[],
  "analysis": string
}

SWAGGER_SPEC:
${swaggerJson}

TEST CASES:
${testCases}

Provide a detailed analysis of coverage, missing areas, and actionable suggestions.
        `.trim();
      } catch (err) {
        return res.status(400).json({ error: 'Failed to fetch Swagger JSON from provided URL' });
      }
    } else if (inputType === 'image') {
      prompt = `
You are a test coverage analyzer that examines if the provided test cases adequately cover the requirements shown in the attached UI screenshots.
- Analyze the screenshots (provided as images) and the test cases (provided as text or structured format).
- Identify which requirements or UI features are covered and which are missing.
- Return your analysis as a JSON object with the following structure:
{
  "coverageScore": number,
  "missingAreas": [{"description": string, "importance": "high"|"medium"|"low"}],
  "coverageDetails": [{"area": string, "covered": boolean, "testCases": string[]}],
  "suggestions": string[],
  "analysis": string
}
If you cannot analyze the images, provide your best effort based on the test cases and mention the limitation in the analysis.
      `.trim();
    } else {
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

    if (inputType === 'text' || inputType === 'swagger' || inputType === 'image' || !inputType) {
      const maxChars = 14000;
      const trimmedTestCases = testCases.length > maxChars 
        ? testCases.substring(0, maxChars) + "... (content truncated for processing)"
        : testCases;
      const trimmedRequirements = requirements && requirements.length > maxChars
        ? requirements.substring(0, maxChars) + "... (content truncated for processing)"
        : requirements;

      let messages = [
        {
          role: 'system',
          content: 'You are a test coverage analyzer that examines if test cases adequately cover requirements, API specifications, or UI specifications. Provide a structured analysis with numerical metrics and actionable recommendations. Your response should be formatted as a JSON object.'
        }
      ];

      if (inputType === 'image' && Array.isArray(imageDataArray) && imageDataArray.length > 0) {
        const imageContentItems = imageDataArray.map((img, idx) => ({
          type: 'image_url',
          image_url: { url: img }
        }));
        messages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: `${prompt}\n\nTEST CASES:\n${trimmedTestCases}`
            },
            ...imageContentItems
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: prompt.replace(testCases, trimmedTestCases)
                         .replace(requirements, trimmedRequirements || '')
        });
      }

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
          timeout: 60000
        });

        try {
          const content = response.data.choices[0].message.content;
          const jsonData = JSON.parse(content);

          const formattedResponse = {
            coverageScore: jsonData.coverageScore || jsonData.coverage || 0,
            missingAreas: jsonData.missingAreas || jsonData.gaps || [],
            coverageDetails: jsonData.coverageDetails || jsonData.coveredAreas || [],
            suggestions: jsonData.suggestions || jsonData.recommendations || [],
            analysis: jsonData.analysis || jsonData.detailedAnalysis || ''
          };

          return res.json(formattedResponse);
        } catch (error) {
          const content = response.data.choices[0].message.content;
          return res.json({
            analysis: content,
            coverageScore: extractCoverageScore(content),
            missingAreas: extractMissingAreas(content),
            suggestions: extractSuggestions(content)
          });
        }
      } catch (openaiError) {
        return res.status(500).json({
          error: 'Error calling AI service for coverage analysis',
          details: openaiError.message,
          coverageScore: null,
          missingAreas: [],
          suggestions: ['Try a smaller input or simpler requirements']
        });
      }
    }
  } catch (error) {
    console.error('Error analyzing test coverage:', error.response?.data || error.message);
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
  const percentageMatch = text.match(/(\d{1,3})%/);
  if (percentageMatch) return parseInt(percentageMatch[1]);
  
  const coverageMatch = text.match(/coverage[:\s]+(\d{1,3})/i);
  if (coverageMatch) return parseInt(coverageMatch[1]);
  
  return null;
}

function extractMissingAreas(text) {
  const missingAreas = [];
  const sections = text.split(/#+\s+/);
  
  for (const section of sections) {
    if (/missing|gap|not covered|lacking/i.test(section)) {
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
  const sections = text.split(/#+\s+/);
  
  for (const section of sections) {
    if (/recommend|suggestion|improve|enhance/i.test(section)) {
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
    
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL;
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    const unselectedPractices = getUnselectedPractices(selectedPractices);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelName,
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
    
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL;
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: modelName,
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
    
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL;
    
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

    if (messages.length > 0 && messages[0].role === 'system') {
      messages[0].content += '\n\nYou MUST return your response as a structured JSON object with the same schema as the input test cases.';
    }

    if (messages.length > 1 && messages[1].role === 'user') {
      messages[1].content += '\n\nPlease return the refined test cases in structured JSON format.';
    }

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
    
    const apiToken = req.headers['x-openai-token'];
    const modelName = req.headers['x-openai-model'] || DEFAULT_MODEL;
    
    if (!apiToken) {
      return res.status(400).json({ 
        error: 'OpenAI API key is required', 
        details: 'Please configure your API key in the settings page' 
      });
    }

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
      model: modelName,
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
