const express = require('express');
const axios = require('axios');
const router = express.Router();

// Endpoint for coverage analysis
router.post('/analyze-coverage', async (req, res) => {
  try {
    const { testCases, requirements, inputType } = req.body;
    const apiKey = req.headers['x-openai-token'] || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(401).json({ error: 'OpenAI API token is required' });
    }

    // Call OpenAI to analyze coverage
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a test coverage analyzer assistant. Your task is to analyze if test cases provide adequate coverage for the given requirements. You must return your analysis as a JSON object."
        },
        {
          role: "user",
          content: `
Please analyze the test coverage for the following requirements and return the results as a JSON object:

REQUIREMENTS:
${requirements}

TEST CASES:
${JSON.stringify(testCases, null, 2)}

Provide your analysis in this JSON format:
{
  "coverageScore": <number>,
  "missingAreas": [{"description": "<description>", "importance": "high|medium|low"}],
  "coverageDetails": [{"area": "<requirement area>", "covered": true|false, "testCases": ["<test case title>"]}],
  "suggestions": ["<suggestion>"]
}
`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // Parse and return the analysis
    const analysisResult = JSON.parse(response.data.choices[0].message.content);
    res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing coverage:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to analyze coverage',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router;