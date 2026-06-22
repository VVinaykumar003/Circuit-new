const mongoose = require('mongoose');

const caseCommentSchema = new mongoose.Schema({
  type: { type: String, enum: ["Internal", "Customer"], required: true },
  user: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const caseTimelineItemSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["create", "assign", "status", "escalate", "comment", "resolve", "close"], 
    required: true 
  },
}, { timestamps: true });

const caseSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  caseNumber: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },
  customer: { type: String, required: true },
  contactPerson: { type: String },
  product: { type: String },
  relatedOrder: { type: String },
  type: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
  status: { 
    type: String, 
    enum: ["Open", "Assigned", "In Progress", "Waiting For Customer", "Resolved", "Closed", "Escalated"], 
    default: "Open" 
  },
  assignedRep: { type: String },
  dueDate: { type: Date },
  slaStatus: { type: String, enum: ["On Track", "Near Breach", "Breached"], default: "On Track" },
  resolutionNotes: { type: String },
  resolutionDate: { type: Date },
  resolutionTimeHours: { type: Number },
  attachments: [{ type: String }],
  comments: [caseCommentSchema],
  timeline: [caseTimelineItemSchema],
}, { timestamps: true });

// Ensure caseNumber is unique within an organization
caseSchema.index({ organization: 1, caseNumber: 1 }, { unique: true });


module.exports = mongoose.model('Case', caseSchema);