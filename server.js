const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API route for generating test cases
app.post('/api/generate-test-cases', async (req, res) => {
  try {
    const { acceptanceCriteria, outputType, language } = req.body;
    
    if (!acceptanceCriteria || !outputType || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You generate Test Cases. It is really important that you do not use Gherkin if the user asked for Procedural, even if the Acceptance Criteria is in Gherkin. Also, the Test Case should contain a title (starting with Validate or Verify, when it\'s possible) and a description. Also, every step needs an Expected Result. But if the user chooses Gherkin, then you have to write it in Gherkin (using Given, When, Then).'
        },
        {
          role: 'user',
          content: `Generate test cases in ${outputType} format for the following acceptance criteria: "${acceptanceCriteria}". Use language: ${language}.`
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
