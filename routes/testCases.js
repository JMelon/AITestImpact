const express = require('express');
const router = express.Router();
const TestCase = require('../models/TestCase');

// Get all test cases
router.get('/', async (req, res) => {
  try {
    const testCases = await TestCase.find().sort({ updatedAt: -1 });
    res.json(testCases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get test case by ID
router.get('/:id', async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    res.json(testCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new test case
router.post('/', async (req, res) => {
  try {
    const { title, content, format, priority, severity, category, tags, state } = req.body;
    
    const newTestCase = new TestCase({
      title,
      content,
      format,
      priority,
      severity,
      category,
      tags: tags || [],
      state,
      history: [{
        content,
        updatedBy: 'System'
      }]
    });

    const savedTestCase = await newTestCase.save();
    res.status(201).json(savedTestCase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update test case
router.put('/:id', async (req, res) => {
  try {
    const { title, content, format, priority, severity, category, tags, state, result } = req.body;
    
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    // Add to history if content changed
    if (content !== testCase.content) {
      testCase.history.push({
        content: testCase.content,
        updatedBy: 'User'
      });
    }
    
    testCase.title = title || testCase.title;
    testCase.content = content || testCase.content;
    testCase.format = format || testCase.format;
    testCase.priority = priority || testCase.priority;
    testCase.severity = severity || testCase.severity;
    testCase.category = category || testCase.category;
    testCase.tags = tags || testCase.tags;
    testCase.state = state || testCase.state;
    testCase.result = result || testCase.result;
    testCase.updatedAt = Date.now();
    
    const updatedTestCase = await testCase.save();
    res.json(updatedTestCase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete test case
router.delete('/:id', async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id);
    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }
    
    await testCase.deleteOne();
    res.json({ message: 'Test case deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
