const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  // Multi-tenant support
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true,
  },
  // The head of the department (manager)
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, { timestamps: true });

// To prevent duplicate department names within the same organization
departmentSchema.index({ name: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);