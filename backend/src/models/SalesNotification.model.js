const mongoose = require('mongoose');

const salesNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Task', 'Lead', 'Order', 'Payment', 'Target', 'Meeting', 'Announcement', 'System'],
    default: 'System'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    default: 'System'
  },
  link: { type: String },
  recipientType: { type: String, enum: ['All', 'Department', 'Employee'], default: 'All' },
  department: { type: String },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SalesNotification', salesNotificationSchema);