const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware
app.use(cors());

// Increase the payload size limit for JSON requests (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API route for generating test cases
app.post('/api/generate-test-cases', async (req, res) => {
  try {
    const { 
      acceptanceCriteria, 
      outputType, 
      language, 
      imageData, 
      swaggerUrl,
      priority,
      severity,
      testType,
      extendedOptions
    } = req.body;
    
    if ((!acceptanceCriteria && !imageData && !swaggerUrl) || !outputType || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
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

When generating test cases, please consider the priority, severity, test type, and test coverage specified above. Focus on creating tests that align with these parameters.`;

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
    } else if (imageData) {
      // For image-based test case generation
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

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-2025-04-14',
      messages: messages
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Error generating test cases', 
      details: error.response?.data || error.message 
    });
  }
});

// API route for quality assessment
app.post('/api/generate-quality-assessment', async (req, res) => {
  try {
    const { selectedPractices } = req.body;
    
    if (!selectedPractices) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const unselectedPractices = getUnselectedPractices(selectedPractices);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-2025-04-14',
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
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Error generating quality assessment', 
      details: error.response?.data || error.message 
    });
  }
});

// API route for test automation code generation
app.post('/api/generate-test-code', async (req, res) => {
  try {
    const { testCase, framework } = req.body;
    
    if (!testCase || !framework) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-2025-04-14',
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
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Error generating test automation code', 
      details: error.response?.data || error.message 
    });
  }
});

// API route for refining test cases
app.post('/api/refine-test-cases', async (req, res) => {
  try {
    const { testCases, outputType, language } = req.body;
    
    if (!testCases || !outputType || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
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

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-2025-04-14',
      messages: messages
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error while calling the OpenAI API:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Error refining test cases', 
      details: error.response?.data || error.message 
    });
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
