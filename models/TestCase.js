const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  format: { type: String, default: 'Procedural' },
  priority: { type: String, default: 'P2-Medium' },
  severity: { type: String, default: 'Major' },
  category: { type: String, default: 'Other' },
  tags: { type: [String], default: [] },
  state: {
    type: String,
    enum: ['Draft', 'Ready', 'In Progress', 'Pass', 'Fail', 'Blocked'],
    default: 'Draft'
  },
  result: { type: String, default: '' },
  structuredData: { type: Object, default: {} },
  history: [{
    content: String,
    updatedBy: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestCase', TestCaseSchema);
