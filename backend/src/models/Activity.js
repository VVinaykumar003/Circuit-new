const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true, // e.g., "Project Created", "Attendance Marked"
    },
    message: {
      type: String,
      required: true, // e.g., "John Doe created a new project 'Office ERP'"
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Links to the specific Task, Leave, Project, etc.
    },
    referenceModel: {
      type: String,
      required: false, // e.g., 'Leave', 'Task', 'Project'
    },
     createdAt: {
    type: Date,
    default: Date.now,
    // Automatically delete the document 7 days (604800 seconds) after creation
    expires: '7d' 
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
