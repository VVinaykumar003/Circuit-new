const mongoose = require('mongoose');
const workUpdateSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  projectId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',       
    required: true,
  },
  description:{
    type: String,
    trim:true,
  },
  attachments:[String],
  status:{
    type: String,
    enum: ['updated', 'notUpdated', 'pending', 'in-progress', 'completed'],
    default: 'updated',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
},
{ timestamps: true }
);

module.exports = mongoose.model('WorkUpdateModel', workUpdateSchema); 