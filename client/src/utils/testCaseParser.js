/**
 * Parser utility to split generated test cases into individual test cases
 */

/**
 * Parse procedural test cases from text content
 * @param {string} content - The generated test case content
 * @returns {Array} Array of individual test cases with id, title and content
 */
export const parseProceduralTestCases = (content) => {
  const testCases = [];
  // Split by Test Case ID pattern
  const testCaseBlocks = content.split(/\*\*Test Case ID:\*\* /);

  // Skip the first element if it's just introductory text
  for (let i = 1; i < testCaseBlocks.length; i++) {
    const block = testCaseBlocks[i];
    
    // Extract ID and title
    const idMatch = block.match(/^(TC-[A-Z]+-\d+)/);
    const titleMatch = block.match(/\*\*Title:\*\* ([^\n]+)/);
    
    if (idMatch && titleMatch) {
      const id = idMatch[1];
      const title = titleMatch[1];
      
      // Add the ID back to make the content complete
      const content = `**Test Case ID:** ${block}`;
      
      testCases.push({
        id,
        title,
        content
      });
    }
  }
  
  return testCases;
};

/**
 * Parse Gherkin test cases from feature file content
 * @param {string} content - The generated Gherkin content
 * @returns {Array} Array of individual test cases with id, title and content
 */
export const parseGherkinTestCases = (content) => {
  const testCases = [];
  
  // Extract feature name and description
  const featureMatch = content.match(/Feature:([^\n]+)/);
  const featureName = featureMatch ? featureMatch[1].trim() : 'Unknown Feature';
  
  // Find all scenarios
  const scenarioBlocks = content.split(/\s*(?:Scenario:|Scenario Outline:)\s+/).slice(1);
  const scenarioHeaders = content.match(/\s*(?:Scenario:|Scenario Outline:)\s+[^\n]+/g) || [];
  
  // Get Background section if exists
  const backgroundMatch = content.match(/Background:[\s\S]+?(?=Scenario:|Scenario Outline:|$)/);
  const backgroundSection = backgroundMatch ? backgroundMatch[0] : '';
  
  // Create a feature header with any content before the first scenario
  const featureHeader = content.split(/\s*(?:Scenario:|Scenario Outline:)\s+/)[0];
  
  scenarioBlocks.forEach((block, index) => {
    if (index < scenarioHeaders.length) {
      const header = scenarioHeaders[index];
      const isOutline = header.includes('Scenario Outline:');
      const scenarioType = isOutline ? 'Scenario Outline:' : 'Scenario:';
      
      // Get the scenario title
      const title = header.replace(scenarioType, '').trim();
      
      // Get tag line if present (line before scenario definition)
      const tagMatch = content.match(new RegExp(`(@[^\\n]+)\\s*${scenarioType}\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
      const tags = tagMatch ? tagMatch[1] : '';
      
      // Create ID from tags or title
      const idMatch = title.replace(/\s+/g, '-').substring(0, 20);
      const id = `SC-${index + 1}-${idMatch}`;
      
      // Assemble the complete scenario with feature header and background
      const fullContent = `Feature: ${featureName}
${featureHeader.split('Feature:')[1]}

${backgroundSection}
${tags ? tags + '\n' : ''}${scenarioType} ${title}
${block}`;

      testCases.push({
        id,
        title,
        content: fullContent,
        tags: tags ? tags.split('@').filter(Boolean).map(t => t.trim()) : []
      });
    }
  });
  
  return testCases;
};

/**
 * Parse test cases based on format
 * @param {string} content - The generated test case content
 * @param {string} format - The format of the test cases
 * @returns {Array} Array of individual test cases
 */
export const parseTestCases = (content, format) => {
  if (!content) return [];
  
  switch (format.toLowerCase()) {
    case 'gherkin':
      return parseGherkinTestCases(content);
    case 'procedural':
    default:
      return parseProceduralTestCases(content);
  }
};
