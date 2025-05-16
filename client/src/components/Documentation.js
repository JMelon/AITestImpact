import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const Documentation = () => {
  const [activeTopic, setActiveTopic] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const topics = [
    { id: 'overview', name: 'Overview' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'security-disclaimer', name: 'Security Disclaimer' },
    { id: 'test-generator', name: 'Test Case Generator' },
    { id: 'coverage-analyzer', name: 'Coverage Analyzer' },
    { id: 'test-code-generator', name: 'Test Code Generator' },
    { id: 'requirement-review', name: 'Requirement Review' },
    { id: 'test-management', name: 'Test Case Management' },
    { id: 'api-reference', name: 'API Reference' },
    { id: 'for-developers', name: 'For Developers' },
    { id: 'faq', name: 'FAQ' }
  ];
  
  // Filter topics based on search query
  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Documentation content for each topic
  const topicContent = {
    'overview': `
# AITestImpact Platform Overview

AITestImpact is an AI-powered testing platform that helps you:

- Generate comprehensive test cases from requirements, UI designs, or API specifications
- Analyze test coverage to identify gaps
- Generate test automation code
- Review requirements for quality issues
- Manage and organize your test cases

## Security Warning

**IMPORTANT: This platform is a demonstration prototype and has NOT undergone security testing or hardening.**

- No security audits or penetration testing have been performed
- Standard security practices may not be implemented
- Data validation and sanitization may be incomplete
- Authentication and authorization are minimal
- There is no encryption for data at rest or in transit
- No secure coding practices have been systematically applied

**Never use this application with sensitive, confidential, or regulated data.** The platform is designed for educational and demonstration purposes only. Use only dummy data or publicly available information when working with this tool.

## Key Features

- **AI-Powered Test Case Generation**: Create detailed test cases from various inputs
- **Test Coverage Analysis**: Identify gaps in your test suite
- **Test Code Generation**: Generate test automation code from test cases
- **Requirement Review**: Analyze requirements for issues and improvements
- **Test Case Management**: Organize and track your test cases
    `,
    
    'getting-started': `
# Getting Started with AITestImpact

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- An OpenAI API key with access to GPT-4 or newer models

## Security Disclaimer

**This application has NOT undergone security testing.** There are no explicit security measures implemented in this platform. It was built for demonstration purposes only and lacks standard security validations and protections.

Your data is primarily sent to the OpenAI API for processing, but we cannot guarantee the security of data in transit or at rest. The application may have security vulnerabilities that have not been identified or addressed.

**By using this application, you acknowledge these risks and agree to:**
- Not use the platform with sensitive, confidential, or regulated data
- Not upload proprietary code or requirements that contain sensitive information
- Use only in isolated test environments, not in production environments
- Assume that data entered may potentially be exposed or compromised

## Configuration

1. **Set up your API Key**: 
   - Click on the Settings icon in the top-right corner
   - Enter your OpenAI API key
   - Select your preferred AI model
   - Save your settings

2. **Choose Your Starting Point**:
   - For test case generation, click "Test Gen" in the navigation bar
   - For test coverage analysis, click "Coverage"
   - For test code generation, click "Code Gen"
   - For requirement review, click "Req Review"
   - For test case management, click "Tests"

## Tips for Best Results

- Be specific and detailed in your requirements or acceptance criteria
- For UI-based testing, provide clear screenshots showing the interface
- For API testing, use complete Swagger/OpenAPI specifications
- Review and refine AI-generated content before using in production
    `,

    'security-disclaimer': `
# Security Disclaimer

## ⚠️ Important Security Information ⚠️

**This application is NOT secure and should be treated as such.**

### Specific Security Limitations

- **No Security Testing**: This application has not undergone any security audits, penetration testing, or vulnerability scanning.
- **No Secure Development Practices**: The application was not developed following secure coding guidelines or best practices.
- **No Input Validation**: Limited validation of user inputs may leave the application vulnerable to injection attacks.
- **No Authentication Security**: Authentication mechanisms are basic and not designed to protect against common attacks.
- **No Data Protection**: Data is not encrypted at rest or in transit (beyond HTTPS).
- **Third-Party Exposure**: All data sent to OpenAI may be subject to their data handling practices.
- **No Compliance**: The platform does not meet requirements for GDPR, HIPAA, SOC2, or any other compliance frameworks.
- **No Security Monitoring**: There are no security monitoring or intrusion detection systems in place.

### What This Means For Users

1. **DO NOT use this platform for:**
   - Personal information (names, addresses, contact details)
   - Business-sensitive information (strategies, unreleased products)
   - Proprietary code or intellectual property
   - Financial or healthcare information
   - Any data subject to regulatory requirements

2. **Only use test or dummy data** that has been specifically created for demonstration purposes.

3. **No Guarantees**: The creators and maintainers make no guarantees about the security or confidentiality of any data processed by this application.

### Recommended Precautions

- Deploy only on isolated networks or local environments
- Use only for educational purposes
- Do not connect to production databases or systems
- Do not expose the application to the public internet
- Consider all data entered into the system as potentially compromised
    `,
    
    'test-generator': `
# Test Case Generator

The Test Case Generator creates comprehensive test cases from:
- Text requirements or acceptance criteria
- UI screenshots
- Swagger/OpenAPI specifications

## Security Notice

**Remember that all data submitted through this form is processed by the OpenAI API** and this application has not undergone security testing. Do not enter sensitive or proprietary information.

## Input Types

### Text Input

1. Select the "Text Input" tab
2. Enter your requirements or acceptance criteria in the text area
3. Configure the advanced settings if needed
4. Click "Generate Test Cases"

### Image Input

1. Select the "Image Input" tab
2. Upload UI screenshots using drag-and-drop or the file selector
3. Configure the advanced settings if needed
4. Click "Generate Test Cases"

### Swagger API

1. Select the "Swagger API" tab
2. Enter the URL to your Swagger/OpenAPI JSON specification
3. Configure the advanced settings if needed
4. Click "Generate Test Cases"

## Advanced Configuration

- **Output Format**: Choose between Procedural and Gherkin formats
- **Language**: Select the language for your test cases
- **Priority**: Set the priority level (P0-Critical to P3-Low)
- **Severity**: Set the severity level (Blocker to Minor)
- **Test Type**: Choose the type of testing (Functional, Performance, etc.)
- **Test Coverage**: Specify the coverage scope (Happy paths, Edge cases, etc.)
- **Refinement Iterations**: Number of times to refine the generated test cases (1-5)

## Working with Generated Test Cases

- Use the "Save to Library" button to save test cases to your library
- Use the "Use in Code Generator" button to generate automation code
- Use the "Analyze Coverage" button to analyze test coverage
- Expand individual test cases to see details and generate specific code
    `,
    
    'coverage-analyzer': `
# Test Coverage Analyzer

The Coverage Analyzer helps you identify gaps in your test coverage by comparing your test cases against requirements.

## Security Notice

**This tool processes your test cases and requirements through AI models.** Do not use with sensitive or proprietary information as there are no security safeguards in place.

## Features

- Analyze test cases against requirements or acceptance criteria
- Calculate coverage score and identify missing areas
- Generate test cases for the missing areas

## How to Use

1. Choose the input type for your requirements (Text, Image, or Swagger)
2. Enter your requirements or upload images
3. Enter your existing test cases
4. Click "Analyze Test Coverage"

## Understanding the Results

The analysis results include:

- **Coverage Score**: Percentage of requirements covered by the test cases
- **Missing Areas**: Parts of the requirements not covered by test cases
- **Coverage Details**: Specific requirements and their coverage status
- **Suggestions**: Recommendations for improving test coverage

## Generating Tests for Missing Areas

If missing areas are found, you can click the "Generate Test Cases for Missing Areas" button to automatically create test cases for those areas.
    `,
    
    'test-code-generator': `
# Test Code Generator

The Test Code Generator converts test cases into executable automation code for various frameworks.

## Security Notice

**The code generation features use AI to process your test cases.** There are no security measures in place to protect your data. Do not use with proprietary test cases or sensitive information.

## Supported Frameworks

- **Web Testing**: Selenium (Java, Python, C#, JavaScript)
- **API Testing**: RestAssured, Postman, SuperTest
- **Mobile Testing**: Appium
- **BDD**: Cucumber with Java/JavaScript

## How to Use

1. Enter your test cases or load them from the Test Case Generator
2. Select the desired automation framework
3. Click "Generate Code"
4. Review and customize the generated code

## Important Notes

- The generated code includes placeholder selectors that need to be replaced with actual element selectors
- Review and modify the generated code to match your specific environment and requirements
- Add proper assertions and validations based on your testing requirements
    `,
    
    'requirement-review': `
# Requirement Review

The Requirement Review tool analyzes requirements for quality issues like ambiguities, contradictions, and missing details.

## Security Notice

**This tool sends your requirements to OpenAI for analysis.** No security measures are in place to protect your data. Do not submit proprietary or sensitive requirements.

## Features

- Identify ambiguities and unclear specifications
- Detect contradictions and inconsistencies
- Highlight missing requirements and edge cases
- Find security vulnerabilities and concerns
- Identify performance implications
- Assess testability issues
- Suggest improvements

## How to Use

1. Enter your requirements in the text area
2. Select the focus areas for analysis
3. Click "Analyze Requirements"
4. Review the findings and recommendations

## Understanding Results

The analysis results include:

- **Issues**: Problems found in the requirements
- **Missing Elements**: Important aspects not covered in the requirements
- **Recommendations**: Suggested improvements
- **Testability Assessment**: Evaluation of how testable the requirements are
    `,
    
    'test-management': `
# Test Case Management

The Test Case Management tool helps you organize, track, and manage your test cases.

## Security Notice

**Test case data is stored in MongoDB without encryption.** There are no security measures to protect this data. Do not store sensitive or proprietary test cases.

## Features

- View and organize all test cases
- Filter by priority, severity, category, and tags
- Track test case execution status
- Update and edit test cases
- View test case history

## Test Case States

- **Draft**: Initial state for newly created test cases
- **Ready**: Test cases ready for execution
- **In Progress**: Test cases currently being executed
- **Pass**: Test cases that have passed execution
- **Fail**: Test cases that have failed execution
- **Blocked**: Test cases that cannot be executed due to blocking issues

## Working with Test Cases

- Click on a test case to view its details
- Use the filter options to find specific test cases
- Use the "Edit" button to modify a test case
- Use the "Delete" button to remove a test case
- Use the "Execute" button to update the execution status
    `,
    
    'api-reference': `
# API Reference

AITestImpact provides a RESTful API for integration with other tools and systems.

## Security Notice

**The API endpoints have no authentication beyond the OpenAI API key.** There are no security measures in place to protect data sent to or received from these endpoints. Use only for demonstration purposes in isolated environments.

## Authentication

All API endpoints require an OpenAI API key for AI operations. Add the API key to the request headers:

\`\`\`
X-OpenAI-Token: your_api_key_here
\`\`\`

## Test Case Generation API

### Generate Test Cases

\`\`\`
POST /api/generate-test-cases
\`\`\`

**Request Body:**

\`\`\`json
{
  "acceptanceCriteria": "String",  // Required for text input
  "imageDataArray": ["base64_images"],  // Required for image input
  "swaggerUrl": "String",  // Required for Swagger input
  "outputType": "Procedural|Gherkin",  // Required
  "language": "String",  // Required
  "priority": "String",  // Optional
  "severity": "String",  // Optional
  "testType": "String",  // Optional
  "extendedOptions": "String"  // Optional
}
\`\`\`

**Response:**

JSON object containing the generated test cases.

### Analyze Test Coverage

\`\`\`
POST /api/analyze-test-coverage
\`\`\`

**Request Body:**

\`\`\`json
{
  "testCases": "String",  // Required
  "requirements": "String",  // Required for text input
  "inputType": "text|image|swagger",  // Required
  "imageDataArray": ["base64_images"]  // Required for image input
}
\`\`\`

**Response:**

JSON object containing the coverage analysis.

### Generate Test Code

\`\`\`
POST /api/generate-test-code
\`\`\`

**Request Body:**

\`\`\`json
{
  "testCase": "String",  // Required
  "framework": "String"  // Required
}
\`\`\`

**Response:**

JSON object containing the generated test code.
    `,
    
    'for-developers': `
# Developer Documentation

This section provides technical information for developers who want to contribute to the AITestImpact platform or run it locally for development purposes.

## Security Notice

**This application has NO security hardening.** Before contributing or deploying, be aware that:

- The codebase has not undergone security review
- There are likely security vulnerabilities present
- No secure coding practices were consistently applied
- There is minimal input validation and sanitization
- The application is designed for demonstration only

## Technology Stack

AITestImpact is built using the following technologies:

### Frontend
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: HTTP client for making API requests
- **React Markdown**: For rendering markdown content

### Backend
- **Node.js**: JavaScript runtime for the server
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database for storing test cases
- **Mongoose**: MongoDB object modeling for Node.js
- **OpenAI API**: For AI-powered test generation and analysis

### Development Tools
- **Docker & Docker Compose**: For containerized development
- **ESLint**: For code linting
- **Nodemon**: For automatic server restarts during development
- **Concurrently**: For running multiple commands concurrently

## Prerequisites

Before you start, make sure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- Docker and Docker Compose
- Git

## Getting Started for Development

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/jmelon/AITestImpact.git
cd AITestImpact
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
\`\`\`

### 3. Configure Environment Variables

Create a \`.env\` file in the root directory with the following content:

\`\`\`
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration - using Docker Compose
ENABLE_MONGODB=true
MONGODB_URI=mongodb://{username}:{password}@localhost:27017/testcases?authSource=admin

\`\`\`

This simple configuration:
- Sets the server port and environment
- Enables MongoDB integration
- Configures the MongoDB connection string to match the Docker Compose service name
- Sets the default AI model

### 4. Set Up MongoDB with Docker Compose

The project already includes a fully configured \`docker-compose.yml\` file that defines a MongoDB service. You don't need to create or modify this file.

To start MongoDB using the existing Docker Compose configuration:

\`\`\`bash
# Navigate to the project root directory
cd AITestImpact

# Start MongoDB container
docker-compose up -d mongo
\`\`\`

The MongoDB container will start with:
- The service name 'mongo' (which matches the hostname in the MONGODB_URI)
- Port 27017 exposed to your host machine
- A persistent volume for data storage

No additional MongoDB configuration is required - the application is pre-configured to work with this setup.

### 5. Run the Application

#### Using Docker Compose (Full Stack)

\`\`\`bash
# Start both MongoDB and the application
docker-compose up -d
\`\`\`

#### Running Locally (Development Mode)

\`\`\`bash
# Run both server and client concurrently
npm run dev

# Or run them separately
# Terminal 1 - Server
npm run server

# Terminal 2 - Client
npm run client
\`\`\`

The server will run on http://localhost:5000 and the client on http://localhost:3000.

## Project Structure

\`\`\`
AITestImpact/
├── client/                 # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source files
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main App component
│   │   └── index.js        # Entry point
│   └── package.json        # Client dependencies
├── models/                 # MongoDB models
├── routes/                 # Express routes
├── scripts/                # Utility scripts
├── .env                    # Environment variables
├── docker-compose.yml      # Docker Compose configuration
├── server.js               # Express server
└── package.json            # Server dependencies
\`\`\`

## Key Files

- **server.js**: Main Express server file that handles API routes
- **client/src/App.js**: Main React component that handles routing
- **client/src/components/**: Contains all React components
- **models/TestCase.js**: MongoDB schema for test cases
- **routes/testCases.js**: API routes for test case operations
- **docker-compose.yml**: Docker Compose configuration for MongoDB

## Database Schema

The application uses the following MongoDB collections:

### Test Cases Collection

\`\`\`javascript
{
  title: String,           // Title of the test case
  content: String,         // Content/description of the test case
  format: String,          // Format (Procedural or Gherkin)
  priority: String,        // Priority level (P0-Critical, P1-High, etc.)
  severity: String,        // Severity (Blocker, Critical, Major, Minor)
  category: String,        // Category (API, UI, Functional, Performance, etc.)
  tags: [String],          // Array of tags
  state: String,           // State (Draft, Ready, In Progress, Pass, Fail, Blocked)
  result: String,          // Test result (Pass, Fail, Not Run)
  structuredData: Object,  // Structured representation of the test case
  history: [{              // Version history
    content: String,       // Previous content
    updatedBy: String,     // Who updated it
    timestamp: Date        // When it was updated
  }],
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
\`\`\`

## Troubleshooting Common Issues

### MongoDB Connection Issues

If you're having trouble connecting to MongoDB:

1. Ensure Docker is running
2. Check that the MongoDB container is up: \`docker ps | grep mongo\`
3. Docker logs might show issues: \`docker logs <mongo-container-id>\`
4. Verify the connection string in your .env file
5. Try connecting with MongoDB Compass to verify the server is accessible

### OpenAI API Issues

OpenAI API errors are typically due to:

1. Invalid or missing API key - Set in the Settings page
2. Rate limiting - Reduce request frequency
3. Model availability - Make sure you're using a valid model

### Client-Server Communication

If the client can't communicate with the server:

1. Ensure the server is running on port 5000
2. Check for CORS issues
3. Verify that proxy settings in \`client/package.json\` are correct

## Development Guidelines

1. **No Sensitive Data**: Never commit API keys, credentials, or sensitive data
2. **Testing**: Test thoroughly before submitting PRs
3. **Responsive Design**: Ensure UI works on different screen sizes
4. **Error Handling**: Add proper error handling for all API calls
5. **Comments**: Comment complex code sections
    `,
    
    'faq': `
# Frequently Asked Questions

## General Questions

### Q: Is my data secure?
**A:** **NO. This application has NOT undergone any security testing.** There are no explicit security measures implemented in this platform. It was built for demonstration purposes only and lacks standard security validations and protections.

While your data is primarily sent to the OpenAI API for processing, we cannot guarantee the security of data in transit or at rest. The application may have security vulnerabilities that have not been identified or addressed.

**Important security warnings:**
- Do not use this platform with sensitive, confidential, or regulated data
- Do not upload proprietary code or requirements that contain sensitive information
- Use only in isolated test environments, not in production environments
- Assume that data entered may potentially be exposed or compromised

If you need a secure testing platform for professional use, please use properly vetted commercial solutions.

### Q: Do I need an internet connection?
**A:** Yes, an internet connection is required to use the AI features, as they rely on the OpenAI API.

### Q: Which AI models are supported?
**A:** The platform supports GPT-4 and newer OpenAI models. For best results, we recommend using GPT-4o or GPT-4 Turbo.

## Technical Questions

### Q: Why are my test cases not generating?
**A:** This could be due to:
- Invalid or expired OpenAI API key
- Network issues
- Input that's too large or complex
- Rate limiting by OpenAI

### Q: How can I improve the quality of generated test cases?
**A:** Try:
- Providing more detailed requirements
- Increasing the refinement iterations
- Using multiple screenshots for UI-based testing
- Selecting specific test types and coverage options

### Q: Can I use the platform offline?
**A:** No, the platform requires an internet connection to access the OpenAI API.

### Q: What if I find an error in the generated tests?
**A:** You can:
- Edit the test case directly
- Regenerate with more specific requirements
- Use the refinement feature to improve the test cases
    `
  };
  
  // Handle topic change
  const handleTopicChange = (topicId) => {
    setActiveTopic(topicId);
  };
  
  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Documentation</h3>
        
        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-gray-800 border border-gray-700 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
        
        {/* Topic list */}
        <div className="space-y-1">
          {filteredTopics.map((topic) => (
            <button
              key={topic.id}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTopic === topic.id
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => handleTopicChange(topic.id)}
            >
              {topic.name}
              {topic.id === 'security-disclaimer' && (
                <span className="ml-2 inline-flex items-center justify-center w-4 h-4 bg-red-600 rounded-full text-xs font-bold">!</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="w-full md:w-3/4 bg-gray-900 rounded-xl p-6">
        {activeTopic === 'security-disclaimer' && (
          <div className="mb-4 bg-red-900/30 border border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-300">
                <strong>Critical Notice:</strong> This application has NOT been security tested and is NOT suitable for processing sensitive data. Read the full disclaimer below.
              </p>
            </div>
          </div>
        )}
        
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code: CodeBlock,
              h1: ({node, children, ...props}) => <h1 className="text-2xl font-bold mb-4 mt-0 text-white" {...props}>{children}</h1>,
              h2: ({node, children, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 text-white" {...props}>{children}</h2>,
              h3: ({node, children, ...props}) => <h3 className="text-lg font-medium mt-5 mb-2 text-white" {...props}>{children}</h3>,
              ul: ({node, children, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props}>{children}</ul>,
              ol: ({node, children, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props}>{children}</ol>,
              li: ({node, children, ...props}) => <li className="text-gray-300" {...props}>{children}</li>,
              p: ({node, children, ...props}) => <p className="mb-4 text-gray-300" {...props}>{children}</p>,
              a: ({node, children, ...props}) => <a className="text-blue-400 hover:text-blue-300" {...props}>{children}</a>,
              blockquote: ({node, children, ...props}) => (
                <blockquote className="border-l-4 border-gray-700 pl-4 py-2 mb-4 text-gray-400" {...props}>{children}</blockquote>
              ),
              table: ({node, children, ...props}) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full bg-gray-800 border border-gray-700 rounded-lg" {...props}>{children}</table>
                </div>
              ),
              thead: ({node, children, ...props}) => <thead className="bg-gray-700" {...props}>{children}</thead>,
              tbody: ({node, children, ...props}) => <tbody className="divide-y divide-gray-700" {...props}>{children}</tbody>,
              tr: ({node, children, ...props}) => <tr className="hover:bg-gray-700/50" {...props}>{children}</tr>,
              th: ({node, children, ...props}) => (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" {...props}>{children}</th>
              ),
              td: ({node, children, ...props}) => <td className="px-4 py-3 text-sm text-gray-300" {...props}>{children}</td>
            }}
          >
            {topicContent[activeTopic] || 'Documentation content not found.'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
