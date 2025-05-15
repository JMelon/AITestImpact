const express = require('express');
const mongoose = require('mongoose');
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

// Add the stats endpoint BEFORE the :id endpoint
router.get('/stats', async (req, res) => {
  try {
    // Check if MongoDB is enabled and connected
    if (!mongoose.connection.readyState) {
      // MongoDB not connected, return placeholder data
      return res.json({
        totalCount: 0,
        passedCount: 0,
        failedCount: 0,
        generationCount: 0,
        message: 'MongoDB not connected, showing placeholder data',
        timestamp: new Date()
      });
    }

    // Get counts
    const totalCount = await TestCase.countDocuments();
    const passedCount = await TestCase.countDocuments({ result: 'Pass' });
    const failedCount = await TestCase.countDocuments({ result: 'Fail' });
    
    // For generation count, use creation timestamps as an approximation
    // This is just an estimate based on created timestamps within the last day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentCount = await TestCase.countDocuments({ 
      createdAt: { $gte: oneDayAgo } 
    });
    
    return res.json({
      totalCount,
      passedCount,
      failedCount,
      generationCount: recentCount,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error retrieving test case statistics:', err);
    // Return placeholder data when an error occurs
    return res.json({
      totalCount: 0,
      passedCount: 0,
      failedCount: 0,
      generationCount: 0,
      error: 'Error retrieving statistics',
      timestamp: new Date()
    });
  }
});

// Get test case by ID - this must come AFTER more specific routes
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
