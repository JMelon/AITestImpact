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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
