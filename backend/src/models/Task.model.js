const mongoose = require('mongoose');
const subTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  }
});

const taskSchema=new mongoose.Schema({
  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  projectId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  }
  ,
  title:{
    type: String,
    required: true, 
    trim: true,
  },
  description:{
    type: String,
    trim:true,
  },
  priority:{
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  attachments:[String],
  status:{
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  assignedTo:[
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
    }
  ],
  dueDate:{
    type: Date,
  },
  tag:[String],
   subtasks: [subTaskSchema],
},
{ timestamps: true }
);
  

module.exports=mongoose.model('Task',taskSchema);