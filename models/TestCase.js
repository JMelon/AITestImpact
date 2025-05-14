const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['Procedural', 'Gherkin'],
    default: 'Procedural'
  },
  priority: {
    type: String,
    enum: ['P0-Critical', 'P1-High', 'P2-Medium', 'P3-Low'],
    default: 'P2-Medium'
  },
  severity: {
    type: String,
    enum: ['Blocker', 'Critical', 'Major', 'Minor'],
    default: 'Major'
  },
  category: {
    type: String,
    enum: ['UI', 'API', 'Integration', 'Performance', 'Security', 'Other'],
    default: 'UI'
  },
  tags: [String],
  state: {
    type: String,
    enum: ['Draft', 'Review', 'Approved', 'Obsolete'],
    default: 'Draft'
  },
  result: {
    type: String,
    enum: ['Not Run', 'Pass', 'Fail', 'Blocked'],
    default: 'Not Run'
  },
  history: [{
    content: String,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for commonly queried fields
TestCaseSchema.index({ title: 'text' }); // Text index for search functionality
TestCaseSchema.index({ state: 1 }); // For filtering by state
TestCaseSchema.index({ priority: 1 }); // For filtering by priority
TestCaseSchema.index({ category: 1 }); // For filtering by category
TestCaseSchema.index({ tags: 1 }); // For filtering by tags
TestCaseSchema.index({ updatedAt: -1 }); // For sorting by date (newest first)

module.exports = mongoose.model('TestCase', TestCaseSchema);
