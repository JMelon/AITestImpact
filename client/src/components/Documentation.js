import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

const Documentation = () => {
  const [activeTopic, setActiveTopic] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const topics = [
    { id: 'overview', name: 'Overview' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'test-generator', name: 'Test Case Generator' },
    { id: 'coverage-analyzer', name: 'Coverage Analyzer' },
    { id: 'test-code-generator', name: 'Test Code Generator' },
    { id: 'requirement-review', name: 'Requirement Review' },
    { id: 'test-management', name: 'Test Case Management' },
    { id: 'api-reference', name: 'API Reference' },
    { id: 'advanced-usage', name: 'Advanced Usage' },
    { id: 'faq', name: 'FAQ' }
  ];

  const content = {
    'overview': `
# AITestImpact - AI-Powered Testing Platform

AITestImpact is a comprehensive suite of testing tools designed to revolutionize the software testing process. By leveraging advanced AI capabilities, AITestImpact helps test engineers, QA professionals, and development teams create, analyze, and optimize test cases with unprecedented efficiency.

## Core Features

- **Test Case Generation** - Create comprehensive test cases from requirements, UI designs, or API specs
- **Coverage Analysis** - Analyze test coverage against requirements to identify gaps
- **Test Code Generation** - Convert test cases into executable automation code
- **Requirement Review** - Identify issues, ambiguities, and edge cases in requirements
- **Test Case Management** - Organize and track your test cases throughout the testing lifecycle

## Key Benefits

- 📈 **Increased Efficiency** - Generate test cases in minutes instead of hours
- 🔍 **Enhanced Coverage** - AI identifies edge cases humans might miss
- 🚀 **Faster Delivery** - Streamline testing processes for quicker feedback
- 💪 **Higher Quality** - More thorough testing leads to higher quality software

## Getting Started

Visit the [Getting Started](#getting-started) guide to learn how to use AITestImpact for your testing needs.
    `,
    'getting-started': `
# Getting Started with AITestImpact

This guide will help you get up and running with AITestImpact quickly.

## Quick Start

1. **Select a Tool**: Choose the appropriate tool from the navigation bar based on your current needs
2. **Provide Input**: Enter requirements, upload screenshots, or connect to your API documentation
3. **Configure Options**: Adjust settings as needed for your specific testing context
4. **Generate Results**: Click the generate/analyze button to produce outputs
5. **Review and Refine**: Review the results and refine if necessary
6. **Save or Export**: Save results to the test case manager or export as needed

## Tool Selection Guide

Choose the right tool based on your current phase in the testing process:

- **Test Case Generator** - When you need to create test cases from requirements or designs
- **Coverage Analyzer** - When you want to evaluate if your test cases adequately cover requirements
- **Test Code Generator** - When you need to create automated test scripts from test cases
- **Requirement Review** - When you want to analyze requirements before creating test cases
- **Test Case Manager** - When you need to organize and track your existing test cases

## Example Workflow

Here's a typical workflow using AITestImpact:

1. Start with **Requirement Review** to analyze requirements for potential issues
2. Use **Test Case Generator** to create comprehensive test cases
3. Check coverage with **Coverage Analyzer** to identify any gaps
4. Generate automated tests with **Test Code Generator**
5. Organize everything in **Test Case Manager**

## Tips for Best Results

- Provide detailed requirements for better test case generation
- Use refinement iterations to improve initial test cases
- Select appropriate test priorities and severities for your context
- Regularly analyze coverage to ensure comprehensive testing
- Save generated test cases to build your test library over time
    `,
    'test-generator': `
# Test Case Generator

The Test Case Generator creates comprehensive test cases from various input sources, including text requirements, UI screenshots, and API specifications.

## Features

- Generate test cases from acceptance criteria or user stories
- Create test cases from UI/UX screenshots or mockups
- Produce test cases from Swagger/OpenAPI specifications
- Support for both procedural and Gherkin (BDD) formats
- Multiple refinement iterations for optimized results
- Configure priority, severity, and test coverage focus

## Input Types

### Text Input

Use plain text requirements or acceptance criteria to generate test cases. This works well for:
- User stories
- Feature specifications
- Acceptance criteria
- Functional requirements

### Image Input

Upload screenshots or UI mockups to generate UI-focused test cases. This works well for:
- Website or application interfaces
- Mobile app designs
- Design specifications
- Workflow diagrams

### Swagger API

Provide a Swagger/OpenAPI URL to generate API test cases. This works well for:
- RESTful APIs
- Backend services
- Microservices
- Integration testing

## Output Formats

### Procedural Format

Traditional test cases with:
- Test case ID
- Title
- Objective
- Preconditions
- Steps with expected results
- Postconditions

### Gherkin Format

BDD-style scenarios with:
- Feature description
- Scenario title
- Given-When-Then steps
- Examples tables (for scenario outlines)

## Advanced Configuration

- **Priority**: Set the importance level (P0-Critical to P3-Low)
- **Severity**: Determine the impact of issues (Blocker to Minor)
- **Test Type**: Specify the type of testing (Functional, Performance, etc.)
- **Test Coverage**: Define the scope (Happy paths, Edge cases, etc.)
- **Refinement Iterations**: Number of passes to improve test cases (1-5)

## Usage Tips

- Be specific in your requirements for better test cases
- Use refinement iterations for more comprehensive test cases
- For UI testing, provide clear screenshots that show the entire interface
- For API testing, ensure your Swagger documentation is complete
- After generating, analyze coverage to identify any gaps
    `,
    'coverage-analyzer': `
# Coverage Analyzer

The Coverage Analyzer evaluates if your test cases provide adequate coverage for a set of requirements or specifications.

## Features

- Analyze test coverage against textual requirements
- Evaluate test coverage for UI mockups or screenshots
- Assess API test coverage against Swagger/OpenAPI specifications
- Calculate coverage score and identify gaps
- Provide recommendations for additional test cases
- Generate detailed coverage reports

## Coverage Analysis Process

1. **Input Requirements**: Provide requirements via text, images, or Swagger URL
2. **Input Test Cases**: Provide your existing test cases (any format)
3. **Analysis**: The system analyzes how well the test cases cover the requirements
4. **Results**: Review coverage score, missing areas, and recommendations

## Coverage Score Levels

- **90%+ Coverage**: Excellent - Comprehensive test coverage
- **75-89% Coverage**: Good - Most requirements covered
- **50-74% Coverage**: Moderate - Significant gaps exist
- **<50% Coverage**: Poor - Insufficient test coverage

## Missing Areas Analysis

The analyzer identifies specific requirements or functionality that aren't adequately covered by your test cases. These missing areas are categorized by importance:

- **High Importance**: Critical functionality or requirements that must be tested
- **Medium Importance**: Important functionality that should be tested
- **Low Importance**: Nice-to-have testing that would improve coverage

## Generating Additional Test Cases

You can use the analyzer's recommendations to:

1. Create additional test cases manually
2. Use the Test Case Generator to create tests for missing areas
3. Modify existing test cases to cover more scenarios

## Best Practices

- Aim for at least 80% coverage for critical features
- Prioritize high importance missing areas
- Regularly reassess coverage as requirements evolve
- Use coverage analysis before finalizing your test plan
- Consider all types of testing: functional, negative, edge cases
    `,
    'test-code-generator': `
# Test Code Generator

The Test Code Generator converts written test cases into executable test automation code across multiple frameworks and languages.

## Features

- Generate test code from test cases in any format
- Support for multiple automation frameworks
- Language-specific code generation
- Setup and teardown code generation
- Placeholders for dynamic elements
- Code comments and documentation

## Supported Frameworks

### UI Testing
- Playwright
- Selenium WebDriver
- Cypress
- Puppeteer

### API Testing
- RestAssured
- Postman
- K6
- SuperTest

### Mobile Testing
- Appium
- Detox
- XCUITest

### BDD
- Cucumber
- SpecFlow
- Behave

## Code Generation Process

1. **Input Test Cases**: Paste your test case content
2. **Select Framework**: Choose your preferred automation framework
3. **Generate Code**: The system converts your test case to executable code
4. **Customize**: Modify element selectors and other placeholders as needed

## Example Input/Output

### Input Test Case
\`\`\`
Test Case: Login with valid credentials
1. Navigate to login page
2. Enter valid username
3. Enter valid password
4. Click login button
Expected: User is logged in and redirected to dashboard
\`\`\`

### Output Code (Playwright)
\`\`\`javascript
// Login with valid credentials
test('Login with valid credentials', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://example.com/login');
  
  // Enter valid username
  await page.fill('#username', 'validUser');
  
  // Enter valid password
  await page.fill('#password', 'validPassword');
  
  // Click login button
  await page.click('#loginButton');
  
  // Verify user is logged in and redirected to dashboard
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('.welcome-message')).toBeVisible();
});
\`\`\`

## Best Practices

- Provide detailed steps in your test cases for better code generation
- Include specific expected results for more precise assertions
- Update element selectors based on your actual application
- Add additional validation steps as needed
- Consider data parameterization for data-driven tests
    `,
    'requirement-review': `
# Requirement Review

The Requirement Review tool analyzes requirements for issues that could impact testing and implementation.

## Features

- Identify ambiguities and unclear specifications
- Detect contradictions and inconsistencies
- Highlight security concerns
- Flag potential performance issues
- Identify missing requirements and edge cases
- Assess testability of requirements
- Evaluate alignment with industry standards

## Types of Issues Detected

### Ambiguities
Vague or unclear language that could lead to misinterpretation:
- "System should respond quickly"
- "User-friendly interface"
- "Adequate security measures"

### Contradictions
Conflicting requirements that cannot be simultaneously satisfied:
- One requirement states data should be encrypted, another requires plain text storage
- Conflict between performance requirements and security requirements

### Security Concerns
Potential security vulnerabilities:
- Lack of authentication requirements
- Insecure data storage specifications
- Missing access control requirements

### Performance Issues
Potential performance bottlenecks:
- Unrealistic response time expectations
- Resource-intensive operations without optimization
- Scaling concerns

### Missing Requirements
Common gaps in requirements:
- Error handling not specified
- Edge cases not addressed
- Integration points not defined

### Testability Issues
Requirements that are difficult to verify:
- Subjective criteria without measurable outcomes
- Lack of acceptance criteria
- Complex dependencies

## Usage Process

1. **Input Requirements**: Paste your requirements text
2. **Review**: Click the review button to analyze requirements
3. **Results**: Review findings, categorized by issue type
4. **Improvement**: Use recommendations to improve requirements

## Best Practices

- Review requirements early in the development cycle
- Address high-priority findings before implementation
- Involve stakeholders in resolving ambiguities
- Create acceptance criteria for vague requirements
- Document assumptions for future reference
    `,
    'test-management': `
# Test Case Management

The Test Case Manager helps you organize, track, and manage your test cases throughout the testing lifecycle.

## Features

- Create and edit test cases
- Organize test cases with tags and categories
- Track test execution status
- Filter and search test cases
- View test case history
- Bulk operations for efficient management

## Test Case Properties

- **Title**: Short, descriptive name
- **Content**: Detailed test case steps and expected results
- **Format**: Procedural or Gherkin
- **Priority**: P0-Critical, P1-High, P2-Medium, P3-Low
- **Severity**: Blocker, Critical, Major, Minor
- **Category**: UI, API, Integration, Performance, Security, Other
- **Tags**: Custom labels for organization
- **State**: Draft, Review, Approved, Obsolete
- **Result**: Not Run, Pass, Fail, Blocked
- **History**: Version history of the test case

## Managing Test Cases

### Creating Test Cases
- Create manually in the Test Case Manager
- Import from Test Case Generator
- Bulk import from external sources

### Organizing Test Cases
- Apply tags for custom categorization
- Group by category, priority, or state
- Create custom filters for frequent searches
- Mark obsolete test cases

### Tracking Execution
- Update execution results (Pass, Fail, Blocked)
- Add execution notes and issues
- Track execution history
- View execution statistics

## Filtering and Searching

- **Filter by State**: Draft, Review, Approved, Obsolete
- **Filter by Result**: Not Run, Pass, Fail, Blocked
- **Filter by Category**: UI, API, etc.
- **Filter by Priority**: P0-Critical to P3-Low
- **Search**: Find test cases by title, content, or tags

## Best Practices

- Use consistent naming conventions
- Apply meaningful tags for easy filtering
- Keep test cases up to date with requirement changes
- Regularly clean up obsolete test cases
- Document execution issues clearly
    `,
    'api-reference': `
# API Reference

AITestImpact provides a RESTful API for integration with other tools and systems.

## Authentication

All API requests require authentication with an API token:

\`\`\`
Authorization: Bearer your-api-token
\`\`\`

## Test Case Endpoints

### GET /api/test-cases
Retrieve a list of test cases

Query parameters:
- \`limit\`: Maximum number of results (default: 50)
- \`offset\`: Pagination offset (default: 0)
- \`state\`: Filter by state (Draft, Review, Approved, Obsolete)
- \`category\`: Filter by category
- \`priority\`: Filter by priority
- \`result\`: Filter by result

### GET /api/test-cases/:id
Retrieve a specific test case by ID

### POST /api/test-cases
Create a new test case

Request body:
\`\`\`json
{
  "title": "Test case title",
  "content": "Test case content",
  "format": "Procedural",
  "priority": "P1-High",
  "severity": "Major",
  "category": "UI",
  "tags": ["login", "security"],
  "state": "Draft"
}
\`\`\`

### PUT /api/test-cases/:id
Update an existing test case

### DELETE /api/test-cases/:id
Delete a test case

## Generation Endpoints

### POST /api/generate/test-cases
Generate test cases from requirements

Request body:
\`\`\`json
{
  "requirements": "Requirements text",
  "outputType": "Procedural",
  "refinementCount": 1,
  "priority": "P2-Medium",
  "testType": "Functional"
}
\`\`\`

### POST /api/analyze/coverage
Analyze test coverage

Request body:
\`\`\`json
{
  "requirements": "Requirements text",
  "testCases": "Test cases content"
}
\`\`\`

### POST /api/generate/code
Generate test code from test cases

Request body:
\`\`\`json
{
  "testCase": "Test case content",
  "framework": "Playwright"
}
\`\`\`

## Error Handling

API responses use standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

Error response format:
\`\`\`json
{
  "error": "Error message",
  "details": "Additional error details"
}
\`\`\`
    `,
    'advanced-usage': `
# Advanced Usage

This section covers advanced features and techniques to maximize the value of AITestImpact.

## Advanced Test Generation

### Multi-stage Generation

For complex features, break down requirements into smaller components and generate test cases for each component separately:

1. Generate core functionality test cases
2. Generate edge cases and error handling test cases
3. Generate integration test cases
4. Merge and refine the combined test suite

### Image Sequence Analysis

For multi-step workflows, upload a sequence of UI screenshots to generate comprehensive end-to-end test cases:

1. Prepare screenshots of each step in the workflow
2. Upload all screenshots in order
3. The system will analyze the workflow progression
4. Test cases will cover the entire user journey

### Custom Generation Templates

Create custom test case templates for specific types of testing:

1. Define your template structure
2. Add specific instructions in your requirements
3. Use format directives like [SECURITY_FOCUSED] or [PERFORMANCE_FOCUSED]

## Integration Strategies

### CI/CD Integration

Integrate AITestImpact into your CI/CD pipeline:

\`\`\`yaml
# Example GitHub Actions workflow
name: Test Generation

on:
  pull_request:
    branches: [ main ]
    paths:
      - 'requirements/**'

jobs:
  generate-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Generate Test Cases
        run: |
          curl -X POST "https://api.testmatrix.com/api/generate/test-cases" \\
            -H "Authorization: Bearer \${TESTMATRIX_API_KEY}" \\
            -H "Content-Type: application/json" \\
            -d @- << 'EOF'
            {
              "requirements": "$(cat requirements/new-feature.md)",
              "outputType": "Gherkin"
            }
          EOF
      # Additional steps to save generated tests
\`\`\`

### JIRA Integration

Connect AITestImpact to JIRA for requirements import and test case export:

1. Configure JIRA API credentials
2. Import requirements directly from user stories
3. Generate test cases automatically for new stories
4. Export test cases back to JIRA as test issues

## Advanced Analysis Techniques

### Requirement Classification

Use the requirement analyzer to classify requirements by:
- Risk level
- Testability
- Implementation complexity
- Security sensitivity

### Coverage Gap Analysis

Perform targeted gap analysis:
- Security coverage analysis
- Performance test coverage analysis
- Cross-browser/platform coverage analysis

## Performance Optimization

### Batch Processing

For large sets of requirements:
1. Split requirements into logical batches
2. Process batches in parallel
3. Merge results into consolidated test suites

### Refinement Tuning

Optimize refinement iteration count based on requirement type:
- Critical features: 3-5 iterations
- Standard features: 2-3 iterations
- Minor features: 1 iteration
    `,
    'faq': `
# Frequently Asked Questions

## General Questions

### What is AITestImpact?
AITestImpact is an AI-powered testing platform that helps teams create, manage, and optimize test cases using advanced language models. It streamlines the entire testing process from requirements analysis to test case creation and automation.

### How does AITestImpact use AI?
AITestImpact uses large language models to analyze requirements, generate test cases, evaluate test coverage, review requirements, and generate test automation code. The AI is trained on testing best practices and can understand complex software requirements.

### Is my data secure?
Yes, all data is processed securely. We do not store your requirements or test cases beyond the time needed to process your requests unless you explicitly save them to the Test Case Manager. All API calls use encryption and authentication.

### Do I need an OpenAI API key?
Yes, currently you need to provide your own OpenAI API key to use AITestImpact. This allows you to maintain control over your API usage and costs.

## Test Case Generation

### What types of requirements can I use to generate test cases?
You can generate test cases from:
- Written requirements or acceptance criteria
- UI screenshots or mockups
- Swagger/OpenAPI specifications

### How many test cases can AITestImpact generate at once?
There's no hard limit, but the quality and comprehensiveness depend on the complexity of your requirements. Processing very large requirements might be better done in logical batches.

### What's the difference between Procedural and Gherkin formats?
- **Procedural**: Traditional step-by-step test cases with preconditions, steps, and expected results
- **Gherkin**: BDD-style scenarios using Given-When-Then format, ideal for behavior-driven development

### How do I get the best results from the Test Case Generator?
- Provide clear, specific requirements
- Use refinement iterations for more comprehensive coverage
- Specify the appropriate test type and coverage focus
- Review and adapt generated test cases to your specific context

## Coverage Analysis

### How accurate is the coverage analysis?
The coverage analysis provides a good approximation of how well your test cases cover requirements. It's particularly effective at identifying missing scenarios and edge cases that humans might overlook.

### What if my coverage score is low?
A low coverage score indicates gaps in your test suite. You can:
1. Review the missing areas identified in the analysis
2. Generate additional test cases specifically for those areas
3. Refine existing test cases to cover more scenarios
4. Re-analyze after making improvements

## Test Code Generation

### What languages and frameworks are supported?
Currently, we support code generation for:
- JavaScript/TypeScript (Playwright, Cypress, Puppeteer)
- Java (Selenium, RestAssured)
- Python (Pytest, Selenium)
- C# (NUnit, SpecFlow)

### Do I need to modify the generated code?
While the generated code provides a solid foundation, you'll typically need to:
- Update element selectors for your specific application
- Adjust test data for your environment
- Add application-specific validation
- Handle authentication and configuration

## Technical Issues

### What should I do if I encounter an error?
Most errors are due to:
1. Invalid or expired API keys
2. Input that's too large or complex
3. Network issues

Try:
- Verifying your API key
- Breaking your input into smaller chunks
- Checking your network connection
- Contacting support if issues persist

### How can I report bugs or request features?
Please use our GitHub repository issue tracker or contact our support team directly.
    `
  };

  // Filter topics based on search query
  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left sidebar with topics */}
      <div className="w-full md:w-64 lg:w-72 bg-slate-900 rounded-xl p-6 shadow-lg h-fit">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <nav>
          <ul className="space-y-1">
            {filteredTopics.map(topic => (
              <li key={topic.id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTopic === topic.id
                      ? 'bg-purple-700/30 text-purple-300 border border-purple-700/50'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setActiveTopic(topic.id)}
                >
                  {topic.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content area */}
      <div className="w-full md:flex-1 bg-slate-900 rounded-xl p-6 shadow-lg overflow-auto max-h-[800px]">
        <div className="prose prose-invert prose-headings:scroll-mt-20 prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 max-w-none">
          <ReactMarkdown
            components={{
              code: CodeBlock,
              // Add custom styling for other elements
              h1: ({ node, children, ...props }) => <h1 className="text-2xl font-bold mb-6 text-white" {...props}>{children}</h1>,
              h2: ({ node, children, ...props }) => <h2 className="text-xl font-bold mt-8 mb-4 text-white border-b border-slate-800 pb-2" {...props}>{children}</h2>,
              h3: ({ node, children, ...props }) => <h3 className="text-lg font-bold mt-6 mb-3 text-white" {...props}>{children}</h3>,
              ul: ({ node, ...props }) => <ul className="my-4 space-y-1" {...props} />,
              ol: ({ node, ...props }) => <ol className="my-4 space-y-1" {...props} />,
              li: ({ node, ...props }) => <li className="ml-4" {...props} />,
              table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table className="border-collapse w-full" {...props} /></div>,
              thead: ({ node, ...props }) => <thead className="bg-slate-800" {...props} />,
              th: ({ node, ...props }) => <th className="border border-slate-700 px-4 py-2 text-left" {...props} />,
              td: ({ node, ...props }) => <td className="border border-slate-700 px-4 py-2" {...props} />
            }}
          >
            {content[activeTopic]}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
