const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");
const Project = require("../models/Project.model");
const Task = require("../models/Task.model");
const Activity = require('../models/Activity');
const { getIO } = require("../services/socket.service.js");
const User = require("../models/User.model.js");
const { sendEmailNotification } = require("../utils/notifier");
// -----------------------------------------------------------
// Add Task
// -----------------------------------------------------------

const addTask = async (req, res) => {
  try {
    console.log("TAG FIELD:", req.body.tag);
    const orgId = req.organization._id;
    const userRole = req.user.role;
    const { projectId } = req.params;

    const {
      title,
      description,
      priority,
      status,
      assignedTo,
      dueDate,
      tag,
      subtasks,
    } = req.body;
    console.log("Assigned To:", assignedTo);
console.log("User:", req.user);
    let parsedSubtasks = [];

    let parsedTags = [];

    if (req.body.tag) {
      if (typeof req.body.tag === "string") {
        parsedTags = JSON.parse(req.body.tag);
      } else {
        parsedTags = req.body.tag;
      }
    }
    if (req.body.subtasks) {
      if (typeof req.body.subtasks === "string") {
        parsedSubtasks = JSON.parse(req.body.subtasks);
      } else {
        parsedSubtasks = req.body.subtasks;
      }
    }
    const files = req.files || [];

    // Upload attachments to Cloudinary
    const uploadedAttachments = [];

    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "tasks" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploadedAttachments.push(result.secure_url);
    }

    // Role check
    if (!["admin", "manager", "owner"].includes(userRole)) {
      return res.status(403).json({
        message: "You are not authorized to add tasks",
      });
    }

    // Project validation
    const project = await Project.findOne({ _id: projectId, orgId });
    if (!project) {
      return res.status(404).json({
        message: "Project not found in this organization",
      });
    }

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const task = new Task({
      organization: orgId,
      projectId,
      title,
      description,
      priority,
      attachments: uploadedAttachments,
      status,
      assignedTo: assignedTo ? [assignedTo] : [],
      dueDate,
      tag: parsedTags,
      subtasks: parsedSubtasks,
    });
    

    await task.save();
    const populatedTask = await Task.findById(task._id)
  .populate("assignedTo", "name email");

 // 2. Insert the Activity Log here!
    await Activity.create({
      organization: orgId,
      user: req.user.userId || req.user._id, 
      action: "Task Assigned",
      message: `Created a new task: '${task.title}'`,
      referenceId: task._id,
      referenceModel: "Task"
    });

     
    // 3. Emit Realtime Notification via Socket Service
    try {
      const io = getIO();
      console.log(`📡 Emitting 'new_notification' to user ${assignedTo}`);
      
      // Only notify the assigned user (or default to everyone if unassigned)
      if (assignedTo) {
        io.to(assignedTo.toString()).emit("new_notification", {
          title: "New Task Assigned",
          message: `You have been assigned a new task: '${task.title}'`
        });
      }
    } catch (socketErr) {
      console.error("Failed to emit socket notification:", socketErr.message);
    }

    // 4. Dispatch Email
    try {
      if (populatedTask.assignedTo && populatedTask.assignedTo.length > 0) {
        for (const user of populatedTask.assignedTo) {
          if (user.email) {
            const emailHtml = `
              <h3>New Task Assigned</h3>
              <p>Hello <b>${user.name}</b>,</p>
              <p>You have been assigned a new task: <b>${task.title}</b></p>
              <p><b>Priority:</b> ${priority || "Normal"}<br/><b>Due Date:</b> ${dueDate ? new Date(dueDate).toDateString() : "N/A"}</p>
              <p>Please log in to your dashboard to view the details.</p>
            `;
            await sendEmailNotification(user.email, `New Task Assigned: ${task.title}`, emailHtml);
          }
        }
      }
    } catch (notifierErr) {
      console.error("Failed to send external notifications:", notifierErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: populatedTask,
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// -----------------------------------------------------------
// Update Task
// -----------------------------------------------------------

const updateTask = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userRole = req.user.role;
    const { projectId, taskId } = req.params;

    if (!["admin", "manager", "owner"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update tasks",
      });
    }

    let {
      title,
      description,
      priority,
      status,
      assignedTo,
      dueDate,
      tag,
      subtasks,
    } = req.body;

    const updateFields = {};

    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (priority !== undefined) updateFields.priority = priority;
    if (status !== undefined) updateFields.status = status;
    if (assignedTo !== undefined) updateFields.assignedTo = assignedTo;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;
    if (tag !== undefined) updateFields.tag = tag;

    // FIX: subtasks string -> JSON
    const parsedSubtasks = JSON.parse(subtasks);

    updateFields.subtasks = parsedSubtasks.map((sub) => ({
      ...(sub._id && sub._id.length === 24 ? { _id: sub._id } : {}),
      title: sub.title,
      completed: sub.completed,
    }));
    // FILE UPLOAD SUPPORT
    let uploadedAttachments = [];

    if (req.files && req.files.length > 0) {
      uploadedAttachments = await Promise.all(
        req.files.map((file) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "tasks" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              },
            );
            streamifier.createReadStream(file.buffer).pipe(stream);
          });
        }),
      );
    }
    console.log(req.files);
    const updateQuery = { ...updateFields };

    if (uploadedAttachments.length > 0) {
      updateQuery.$push = {
        attachments: { $each: uploadedAttachments },
      };
    }

   const updatedTask = await Task.findOneAndUpdate(
  { _id: taskId, projectId, organization: orgId },
  updateQuery,
  { new: true, runValidators: true },
)
.populate("assignedTo", "name email")
.populate("subtasks");

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

  // 🟢 Notify the assigned employee when an admin updates their task
  try {
    const io = getIO();
    if (updatedTask.assignedTo && updatedTask.assignedTo.length > 0) {
      updatedTask.assignedTo.forEach(user => {
        io.to(user._id.toString()).emit("new_notification", {
          title: "Task Updated",
          message: `The task '${updatedTask.title}' has been updated.`
        });
      });
    }
  } catch (err) {
    console.error("Socket emit failed for task update", err);
  }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
//------------------------------------------------------------
// Delete Task
// ------------------------------------------------------------

const deleteTask = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userRole = req.user.role;

    const { projectId, taskId } = req.params;

    // Role check
    if (!["admin", "manager", "owner"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete tasks",
      });
    }
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      projectId,
      organization: orgId,
    });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Delete the related activity so it disappears from the recent activity feed
    await Activity.deleteMany({ referenceId: taskId, referenceModel: "Task" });

    return res.json({
      success: true,
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//-----------------------------
//Get Tasks
//-----------------------------

// const getTasks = async (req, res) => {
//   try {
//     const orgId = req.organization._id;
//     const userId = req.user._id;
//     const userRole = req.user.role;

//     const { projectId } = req.params;
//     const { filter } = req.query;

//     let query = {
//       organization: orgId,
//       projectId,
//     };

//     // Employee  only their tasks
//     if (!["admin", "manager", "owner"].includes(userRole)) {
//       query.assignedTo = userId;
//     }

//     const now = new Date();

//     // Overdue tasks
//     if (filter === "overdue") {
//       query.dueDate = { $lt: now };
//       query.status = { $ne: "Completed" };
//     }

//     // High priority tasks
//     if (filter === "high") {
//       query.priority = "High";
//     }

//     // This week tasks
//     if (filter === "week") {
//       const startOfWeek = new Date();
//       startOfWeek.setDate(now.getDate() - now.getDay());

//       const endOfWeek = new Date();
//       endOfWeek.setDate(startOfWeek.getDate() + 6);

//       query.dueDate = {
//         $gte: startOfWeek,
//         $lte: endOfWeek,
//       };
//     }

//     const tasks = await Task.find(query)
//       .populate("assignedTo", "name email")
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       count: tasks.length,
//       data: tasks,
//     });
//   } catch (err) {
//     console.error("Get Tasks Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

const getTasks = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userId = req.user._id;
    const userRole = req.user.role;

    const { projectId } = req.params;
    const { filter,memberId } = req.query;

    let query = {
      organization: orgId,
    };
  if (memberId) {
  query.assignedTo = memberId;
}
    // If projectId provided → filter by project
    if (projectId) {
      query.projectId = projectId;
    }

    // Employee → only their tasks
    if (!["admin", "manager", "owner"].includes(userRole)) {
      query.assignedTo = userId;
    }

    const now = new Date();

    // Overdue tasks
    if (filter === "overdue") {
      query.dueDate = { $lt: now };
      query.status = { $ne: "Completed" };
    }

    // High priority
    if (filter === "high") {
      query.priority = "High";
    }

    // This week
    if (filter === "week") {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());

      const endOfWeek = new Date();
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      query.dueDate = {
        $gte: startOfWeek,
        $lte: endOfWeek,
      };
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// -----------------------------------------------------------
//Update Task Status
// -----------------------------------------------------------
const updateTaskStatus = async (req, res) => {
  try {
    const orgId = req.organization._id;

    const { projectId, taskId } = req.params;
    const { status } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, projectId, organization: orgId },
      { status },
      { new: true, runValidators: true },
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    try {
      const io = getIO();
      const admins = await User.find({ organization: orgId, role: { $in: ['admin', 'manager', 'owner'] } });
      
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit("new_notification", {
          title: "Task Status Updated",
          message: `Task '${updatedTask.title}' status changed to ${status}.`
        });
      });
    } catch (err) {
      console.error("Socket emit failed for task status update", err);
    }

    return res.json({
      success: true,
      message: "Task status updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//-------------------------------------------
//Update SubTask Status
//-------------------------------------
const updateSubtaskStatus = async (req, res) => {
  try { 
    const { taskId, subtaskId } = req.params;
    const orgId = req.organization._id;

    const task = await Task.findOne({
      _id: taskId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const subtask = task.subtasks.id(subtaskId);

    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found",
      });
    }

    subtask.completed = !subtask.completed;

    await task.save();

    // 🟢 Notify Admins when an employee updates a subtask
    try {
      const io = getIO();
      const admins = await User.find({ organization: orgId, role: { $in: ['admin', 'manager', 'owner'] } });
      
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit("new_notification", {
          title: "Subtask Updated",
          message: `Subtask '${subtask.title}' in '${task.title}' was marked ${subtask.completed ? 'completed' : 'incomplete'}.`
        });
      });
    } catch (err) {
      console.error("Socket emit failed for subtask status update", err);
    }

    res.json({
      success: true,
      message: "Subtask updated",
      data: subtask,
    });
  } catch (error) {
    console.error("Update subtask error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  addTask,
  updateTask,
  deleteTask,
  getTasks,
  updateTaskStatus,
  updateSubtaskStatus,
};
