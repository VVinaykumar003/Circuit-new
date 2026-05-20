const Project = require("../models/Project.model");
const Activity = require('../models/Activity');
const logger = require("../common/libs/logger.js");
const { getIO } = require("../services/socket.service.js");
const User = require("../models/User.model.js");

// -----------------------------------------------------------------------------
//Create a new project
// ---------------------------------------------------------------
const createProject = async (req, res) => {
  try {
    logger.info("Received request to create project with data", { body: req.body, userId: req.user._id, organizationId: req.organization._id });
    const {
      projectName,
      projectState,
      startDate,
      endDate,
      domain,
      customDomain,
      description,
      participants,
    } = req.body;

    const orgId = req.organization._id;

    //  Basic validation
    if (!projectName || !startDate || !domain) {
      return res.status(400).json({
        success: false,
        message: "projectName, startDate and domain are required",
      });
    }

    //  Custom domain validation
    if (domain === "Other" && !customDomain) {
      return res.status(400).json({
        success: false,
        message: "Please provide custom domain",
      });
    }

    //  Date validation
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    //  Handle participants
    let uniqueParticipants = [];

    if (participants && participants.length > 0) {
      const seen = new Set();

      uniqueParticipants = participants.filter((p) => {
        if (!p.user || !p.role || !p.responsibility) return false;

        if (seen.has(p.user.toString())) return false;

        seen.add(p.user.toString());
        return true;
      });
    }

    //  Create project
    const project = await Project.create({
      projectName,
      projectState,
      startDate,
      endDate,
      domain,
      customDomain: domain === "Other" ? customDomain : "",
      description,
      participants: uniqueParticipants,
      orgId,
    });

     // 2. Insert the Activity Log here!
    await Activity.create({
      organization: orgId,
      user: req.user.userId || req.user._id,
      action: "Project Created",
      message: `New project '${project.projectName}' was created`,
      referenceId: project._id,
      referenceModel: "Project"
    });

    // 3. Emit Realtime Notification to Admins/Managers
    try {
      const io = getIO();
      const admins = await User.find({ organization: orgId, role: { $in: ['admin', 'owner', 'manager'] } });
      
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit('new_notification', {
          title: "Project Created",
          message: `A new project '${project.projectName}' was created.`,
          priority: "normal"
        });
      });
    } catch (err) {
      logger.error("Socket emit failed for project creation", err);
    }

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ---------------------------------------------------------------
//get  projects
// ---------------------------------------------------------------

const getProjects = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userId = req.user._id;
    const userRole = req.user.role;

    const { projectState } = req.query;

    let filter = {
      orgId,
    };

    if (projectState) {
  const normalizedState = projectState
    .toLowerCase()
    .replace("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  filter.projectState = normalizedState;
}

    // Role-based access
    if (!["admin", "owner", "manager"].includes(userRole)) {
      filter["participants.user"] = userId;
    }

    const projects = await Project.find(filter)
      .populate("participants.user")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (err) {
    console.error("Get Projects Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// -----------------------------------------------------------------------------
//Edit Project
// -----------------------------------------------------------------------------
const editProject = async (req, res) => {
  try {
      const orgId = req.organization._id;
 
    const userRole = req.user.role; 
    const { projectId } = req.params;
    const {
     projectName,
      projectState,
      startDate,
      endDate,
      domain,
      customDomain,
      description,
      participants,
    } = req.body;

    //  Check if user is admin or owner
    if (userRole !== "owner" && userRole !== "admin") {
      return res.status(403).json({ message: "You are not authorized to edit this project" });
    }

    // Find the project
    let project = await Project.findOne({ _id: projectId, orgId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update fields
    if (projectName) project.projectName = projectName;
    if (projectState) project.projectState = projectState;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (domain) {
      project.domain = domain;
      project.customDomain = domain === "Other" ? customDomain || "" : "";
    }
    if (description) project.description = description;
    if (participants) {
      const seen = new Set();
      project.participants = participants.filter((p) => {
        if (!p.user || !p.role || !p.responsibility) return false;
        if (seen.has(p.user.toString())) return false;
        seen.add(p.user.toString());
        return true;
      });
    }

    await project.save();

    // Update the Activity log to reflect the change
    await Activity.findOneAndUpdate(
      { referenceId: projectId, referenceModel: "Project" },
      { 
        action: "Project Updated", 
        message: `Updated project: '${project.projectName}'`
      }
    );

    res.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------------------------------------------------------
//delete project
// -----------------------------------------------------------------------------

const deleteProject = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userRole = req.user.role;
    const { projectId } = req.params;

  

    // role check
    if (userRole !== "owner" && userRole !== "admin") {
      return res.status(403).json({
        message: "You are not authorized to delete this project",
      });
    }

 
    const deleted = await Project.findOneAndDelete({
      _id: projectId,
      orgId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Delete the related activity
    await Activity.deleteMany({ referenceId: projectId, referenceModel: "Project" });

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProjectParticipants = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      orgId,
    }).populate("participants.user", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
const participants = project.participants
  .filter((p) => p.user)
  .map((p) => ({
    id: p.user._id,
    name: p.user.name,
    email: p.user.email,
    role: p.role,
    responsibility: p.responsibility,
  }));

    res.json({
      success: true,
      participants,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getProjectById = async (req, res) => {
  try {
    const orgId = req.organization._id; // ye auth middleware se milega
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const project = await Project.findOne({
      _id: projectId,
      orgId, // org filter
    })
      .populate("participants.user")
     
      .exec();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      success: true,
      project,
    });
  } catch (err) {
    console.error("Get Project By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { createProject, getProjects,editProject, deleteProject, getProjectParticipants ,getProjectById };
