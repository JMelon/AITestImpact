# AITestImpact

**AITestImpact** is an AI-powered platform designed to support software testing process by automatically generating test cases, analyzing requirements, and providing actionable testing insights.

> **Important Disclaimer - MVP Version**
> This is a **Minimum Viable Product (MVP)** version of AITestImpact. The platform is under active development and may contain bugs, inconsistencies, or produce unexpected results. Use at your own risk. AI-generated content should be reviewed by professionals before use in production. No guarantees are made regarding the accuracy, completeness, or reliability of generated test cases and outputs.

> **Security Notice**
> This application has not undergone security testing. It is built for demonstration purposes and lacks standard security validations. Please use with non-sensitive data in isolated test environments only.

---

## Features

- **Test Case Generator**: Generate comprehensive test cases from requirements, UI screenshots, or API specs.
- **Coverage Analyzer**: Analyze test coverage against requirements to identify gaps and improve quality.
- **Test Code Generator**: Convert test cases into executable test automation code across frameworks.
- **Requirement Review**: Analyze requirements for issues, ambiguities, and edge cases before creating test cases.
- **Test Case Manager**: Organize, track, and manage test cases throughout the testing lifecycle.
- **Documentation**: Learn how to use all features and get the most out of the platform.

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (for MongoDB, optional)

### 1. Clone the Repository
```sh
git clone https://github.com/JMelon/AITestImpact.git
cd aitestimpact
```

### 2. Install Dependencies
```sh
npm install
cd client && npm install
```

### 3. Start MongoDB (Optional, for test case management)
You can use Docker Compose:
```sh
docker-compose up -d
```

### 4. Configure Environment Variables
Copy `.env` and adjust as needed:
```
ENABLE_MONGODB=true
MONGODB_URI=mongodb://admin:password@localhost:27017/testcases?authSource=admin
PORT=5000
NODE_ENV=development
```

### 5. Start the Application
In the root folder:
```sh
npm run dev
```
- The client will be available at [http://localhost:3000](http://localhost:3000)
- The server will run at [http://localhost:5000](http://localhost:5000)

---

## Screenshots

### Settings
![Settings](client/public/screenshots/settings-2025-05-16T08-54-33-993Z.png)

### Homepage
![Homepage](client/public/screenshots/homepage-2025-05-16T08-54-49-093Z.png)

### Test Case Generator
![Test Case Generator](client/public/screenshots/test-case-generator-2025-05-16T08-55-08-198Z.png)

### Coverage Analyzer
![Coverage Analyzer](client/public/screenshots/coverage-analyzer-2025-05-16T08-55-22-860Z.png)

### Test Code Generator
![Test Code Generator](client/public/screenshots/test-code-generator-2025-05-16T08-55-45-695Z.png)

### Requirement Review
![Requirement Review](client/public/screenshots/requirement-review-2025-05-16T08-56-00-495Z.png)

### Test Case Manager
![Test Case Manager](client/public/screenshots/test-case-manager-2025-05-16T09-12-10-545Z.png)

### Documentation
![Documentation](client/public/screenshots/documentation-2025-05-16T08-51-34-221Z.png)

---

## Documentation & Usage

### Test Case Generator
Generate test cases from requirements, screenshots, or Swagger API specs. Supports procedural and Gherkin formats, multiple languages, and refinement iterations for improved quality.

### Coverage Analyzer
Analyze your test cases against requirements to identify missing areas and improve coverage. Supports both AI-powered and heuristic-based analysis.

### Test Code Generator
Convert test cases into automation code for frameworks like Playwright, Selenium, Cypress, and more. Always review and update selectors before using generated code.

### Requirement Review
Analyze requirements for ambiguities, missing details, and edge cases before test case generation.

### Test Case Manager
Organize, search, filter, and manage your test cases. Supports editing, deleting, and tracking test case status.

### Documentation
Access in-app documentation for detailed usage instructions, tips, and API reference.

---

## System Statistics
- **Test Case Inventory**: Track the total number of test cases in the system.
- **Test Pass Rate**: Visualize the pass/fail rate of your test cases.

---

## Credits
Created during Nordic Testing Days 2025 - Tutorial: Building an AI-Powered Testing Tools Platform

Built by AI - Powered by AI
