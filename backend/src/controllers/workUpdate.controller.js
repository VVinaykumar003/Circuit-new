const Activity = require("../models/Activity");
const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");
const WorkUpdateModel = require("../models/WorkUpdate.model");
const ProjectModel = require("../models/Project.model");

// Add Work Update

const addWorkUpdate = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userId = req.user.userId || req.user._id;
    const userRole = req.user.role;
    const { projectId } = req.params;

    const { description, status } = req.body;

    // Project validation
    const project = await ProjectModel.findOne({
      _id: projectId,
      organization: orgId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found in this organization",
      });
    }

    // Upload attachments to Cloudinary
    const files = req.files || [];
    const uploadedAttachments = [];

    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "work-updates" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploadedAttachments.push(result.secure_url);
    }

    // Create work update
    const workUpdate = new WorkUpdateModel({
      organization: orgId,
      projectId,
      description,
      attachments: uploadedAttachments,
      status: status || "updated",
      createdBy: userId,
    });

    await workUpdate.save();

    const populatedWorkUpdate = await WorkUpdateModel.findById(workUpdate._id)
      .populate("createdBy", "name email role")
      .populate("projectId", "name");

    // Activity log
    await Activity.create({
      organization: orgId,
      user: userId,
      action: "Work Update Added",
      message: `Added a work update in project '${project.name}'`,
      referenceId: workUpdate._id,
      referenceModel: "WorkUpdateModel",
    });

    // Socket notification
    const io = req.app.get("io");
    if (io) {
      io.emit("new_notification", {
        action: "Work Update Added",
        message: `New work update added in project '${project.name}'`,
      });
    }

    res.status(201).json({
      success: true,
      message: "Work update added successfully",
      data: populatedWorkUpdate,
    });
  } catch (error) {
    console.error("Add Work Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get work updates




const getWorkUpdates = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userId = req.user.userId || req.user._id;
    const userRole = req.user.role;

    const { projectId } = req.query;

    let query = {
      organization: orgId,
    };

    // If projectId exists → get all participants
    if (projectId) {
      const project = await ProjectModel.findById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      
      const participants = project.participants.map(p => p.user);

      // Show updates of all participants
      query.projectId = projectId;
      query.createdBy = { $in: participants };
    } 
    else {
      //  Normal role-based filtering
      if (!["admin", "manager", "owner"].includes(userRole)) {
        query.createdBy = userId;
      }
    }

    const updates = await WorkUpdateModel.find(query)
      .populate("createdBy", "name email role")
      .populate("projectId", "projectName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: updates.length,
      data: updates,
    });
  } catch (error) {
    console.error("Fetch Work Updates Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// Edit work update

const editWorkUpdate = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userId = req.user.userId || req.user._id;

    const { updateId } = req.params;
    const { description, status, projectId } = req.body;
 
    // Find update
    const workUpdate = await WorkUpdateModel.findOne({
      _id: updateId,
      organization: orgId,
    });
   if (projectId) {
      workUpdate.projectId = projectId;
    }
    if (!workUpdate) {
      return res.status(404).json({
        success: false,
        message: "Work update not found",
      });
    }

    //  STRICT: Only creator can edit
    if (workUpdate.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own updates",
      });
    }

    //  Upload new attachments
    const files = req.files || [];
    const uploadedAttachments = [];

    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "work-updates" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploadedAttachments.push(result.secure_url);
    }

    // Update fields
    if (description) workUpdate.description = description;
    if (status) workUpdate.status = status;

    // 📎 Append attachments
    if (uploadedAttachments.length > 0) {
      workUpdate.attachments = [
        ...workUpdate.attachments,
        ...uploadedAttachments,
      ];
    }

    await workUpdate.save();

    const populatedWorkUpdate = await WorkUpdateModel.findById(workUpdate._id)
      .populate("createdBy", "name email role")
      .populate("projectId", "projectName");

    res.status(200).json({
      success: true,
      message: "Work update updated successfully",
      data: populatedWorkUpdate,
    });
  } catch (error) {
    console.error("Edit Work Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//delete work update 
const deleteWorkUpdate = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userId = req.user.userId || req.user._id;
    const userRole = req.user.role;

    const { updateId } = req.params;

    const workUpdate = await WorkUpdateModel.findOne({
      _id: updateId,
      organization: orgId,
    });

    if (!workUpdate) {
      return res.status(404).json({
        success: false,
        message: "Work update not found",
      });
    }

    //  Permission check
    const isOwnerOrAdmin = ["owner", "admin"].includes(userRole);
    const isCreator =
      workUpdate.createdBy.toString() === userId.toString();

    if (!isOwnerOrAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this update",
      });
    }

    await workUpdate.deleteOne(); 

    res.status(200).json({
      success: true,
      message: "Work update deleted successfully",
    });
  } catch (error) {
    console.error("Delete Work Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  addWorkUpdate,
  getWorkUpdates,
  editWorkUpdate,
  deleteWorkUpdate,
};
