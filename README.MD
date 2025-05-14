## Tutorial: Building an AI-Powered Testing Tools Platform
Tiago Gomes
Lead QA Consultant, Thoughtworks

Vivianne Guimarães
Lead QA Consultant, Thoughtworks

### Schedule
Date: 14th May  

9:00 - 10:30 Tutorial  
10:30 - 10:45 Coffee break  
10:45 - 12:30 Tutorial  
12:30 - 13:30 Lunch
13:30 - 15:00 Tutorial  
15:00 - 15:15 Coffee break  
15:15 - 17:00 Tutorial

Bonus: LLM testing (How to trick an AI (and why you should try it))

### Tutorial
Objective: MVP of AI powered testing tools platform.

#### Basic functionality:
- AI generates test cases from acceptance critirea
- AI generates test cases from UI screenshots
- AI generates test cases from Swagger/OpenAPI documentation
- Smart suggestions for edge cases
- Test quality insights
- Natural language interface
- Quality Assessment tool for projects based on implemented practices

#### Additional ideas:
- AI generates test cases from user interface
- AI generates test cases from technical documentation (for REST API)
- Input requirement review and notes creation (contradictions, possible security issues, possible performance issues, contextual missalignment, and more)
- Self-maintenance
    - checking for documentation updates
    - adjusting basd on previous test run (notes)
    - in best case scenario AI tries to run the test itself and adjust it based on what it encounters (keeping the requirement in mind)
- Test case management (history, results, priority, categories, tags, states)
- Test sessions and report generation - both manual and automated
- Automated functional test code generator for Playwright (for both UI and API in defined stack (can be configured as input))
- Automated performance test code generator for K6
- Jira integration to be able to link test cases and results to jira tickets


Live Deployment: https://v0-test-case-generator-code-bsi2qg7nd-jmelons-projects.vercel.app/

#### Questions?
How to address the issue with trust - AI is not always doing what we need to and not always do good enough work. This would result in trust issues and then reviewing everything that AI is doing which can neglect the benefit of using it.
It can enhance the end result but can it actually help speed up things?


