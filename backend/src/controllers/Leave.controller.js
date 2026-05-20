const Leave = require("../models/Leave.model");
const User = require("../models/User.model");
const logger = require("../common/libs/logger");
const Activity = require('../models/Activity');
const { getIO } = require("../services/socket.service");
const { sendEmailNotification } = require("../utils/notifier");

// Safe Chalk Import
let chalk;
try {
  chalk = require("chalk");
  if (typeof chalk.red !== "function") throw new Error("Chalk not loaded");
} catch (e) {
  const identity = (str) => str;
  chalk = {
    cyan: identity,
    green: identity,
    yellow: identity,
    red: identity,
    blue: identity,
    white: identity,
    gray: identity,
    bgRed: identity,
  };
}

// ------------------------------------------------
// APPLY FOR LEAVE (Used by User/Employee)
// ------------------------------------------------
exports.applyLeave = async (req, res) => {
  try {
    // Frontend sends: type, fromDate, toDate, reason, attachments, session, emergency
    const {name, type, fromDate, toDate, reason, attachments, session, emergency } = req.body;
    
    // Assuming your auth middleware puts decoded JWT directly into req.user
    const userId = req.user.userId || req.user._id; 
    const slug = req.organization.slug; // Set by tenant middleware
     // 👉 Save leave in DB (your existing logic)

  console.log("📩 Leave applied by:", userId);


    let processedAttachments = [];
    if (attachments) {
      if (typeof attachments === "string") {
        try {
          const parsed = JSON.parse(attachments);
          processedAttachments = Array.isArray(parsed) ? parsed : [attachments];
        } catch (e) {
          processedAttachments = [attachments];
        }
      } else if (Array.isArray(attachments)) {
        processedAttachments = attachments;
      }
      processedAttachments = processedAttachments.filter((item) => typeof item === "string" && item.trim() !== "");
    }

    logger.info("Apply leave request", { userId, leaveType: type, startDate: fromDate, endDate: toDate });

    const leave = await Leave.create({
      user: userId,
      slug,
      name,
      leaveType: type,
      startDate: fromDate,
      endDate: type === "half-day" ? fromDate : toDate, // Default endDate to fromDate for half-days
      reason,
      attachments: processedAttachments,
      session: type === "half-day" ? session : undefined,
      emergency: emergency || false,
      status: "pending",
    });

    console.log(chalk.green(`✔ Leave applied → User:${userId} for ${type}`));

     // 2. Insert the Activity Log here!
    await Activity.create({
      organization: req.organization._id,
      user: userId, 
      action: "Leave Applied",
      message: ` ${name} applied for leave: ${type}`,
      referenceId: leave._id,
      referenceModel: "Leave"
    });
    logger.info("Leave application activity logged", { userId, leaveId: leave._id });
    
    // 3. Emit Realtime Notification to Admins/Managers
    try {
      const io = getIO();
      const admins = await User.find({ organization: req.organization._id, role: { $in: ['admin', 'owner', 'manager'] } });
      
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit("new_notification", {
          title: "New Leave Request",
          message: `Employee ${name || userId} applied for leave`,
        });
      });
    } catch (err) {
      logger.error("Socket emit failed", err);
    }

    // 4. Dispatch Email
    try {
      const emailHtml = `
        <h3>New Leave Request</h3>
        <p><b>${name || userId}</b> has requested ${type} leave.</p>
        <p>Please log in to the Circuit ERP dashboard to approve or reject this request.</p>
      `;
      await sendEmailNotification("manager@company.com", "Action Required: Leave Request Pending", emailHtml);
    } catch (notifierErr) {
      logger.error("Failed to send external notifications", { error: notifierErr.message });
    }


    res.status(201).json({
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    logger.error("Apply leave failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
// GET MY LEAVES (Used by User/Employee)
// ------------------------------------------------
exports.getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;
    const slug = req.organization.slug; // Set by tenant middleware

    logger.info("Get my leaves request", { userId ,slug });

    const leaves = await Leave.find({ user: userId, slug })
      .sort({ createdAt: -1 });

      logger.info("Get my leaves response", { userId, count: leaves.length ,slug });

  return  res.json({
      message: "Leaves retrieved successfully",
      leaves,
      count: leaves.length,
    });
  } catch (error) {
    logger.error("Get my leaves failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
// GET ALL LEAVES (Used by Admin/Owner/Manager)
// ------------------------------------------------
exports.getAllLeaves = async (req, res) => {
  try {
    const slug = req.organization.slug; // Set by tenant middleware
    logger.info("Get all leaves request", { slug });
    const { status } = req.query; // allows filtering (e.g., ?status=pending)
    logger.info("Get all leaves request with filters", { slug, status });

    logger.info("Get all leaves request", { slug, status });

    const query = { slug };
    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate("user", "name email designation department")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      message: "All leaves retrieved successfully",
      leaves,
      count: leaves.length,
    });
  } catch (error) {
    logger.error("Get all leaves failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
// GET LEAVE BY ID (Used by Any Role)
// ------------------------------------------------
exports.getLeaveById = async (req, res) => {
  try {
    const { leaveId } = req.params;
    logger.info("Get leave by ID request", { leaveId });
    const slug = req.organization.slug; // Set by tenant middleware
    logger.info("Get leave by ID request with slug", { leaveId, slug });

    const leave = await Leave.findOne({ _id: leaveId, slug })
      .populate("user", "name email designation department")
      .populate("approvedBy", "name email");

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    res.json({
      message: "Leave retrieved successfully",
      leave,
    });
  } catch (error) {
    logger.error("Get leave by ID failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
// UPDATE LEAVE STATUS (Used by Admin/Owner/Manager)
// ------------------------------------------------
exports.updateLeaveStatus = async (req, res) => {
  try {
    console.log(req.params)
    const { leaveId } = req.params;
    const { status, managerRemarks } = req.body;
    const approverId = req.user.userId || req.user._id;
    const slug = req.organization.slug; // Set by tenant middleware

    logger.info("Update leave status request", { leaveId, status, approverId });

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
    }

    const leave = await Leave.findOneAndUpdate(
      { _id: leaveId, slug },
      { 
        status, 
        managerRemarks,
        approvedBy: approverId,
        actionDate: new Date()
      },
      { returnDocument: 'after' }
    ).populate("user", "name email");
    logger.info(`leaves:  ${leave}`);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    console.log(chalk.yellow(`⚙ Leave ${status} → ${leave.user?.email}`));
    
    // Sync activity for approved/rejected leave
    await Activity.findOneAndUpdate(
      { referenceId: leaveId, referenceModel: "Leave" },
      { 
        action: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`, 
        message: `Leave ${status} for ${leave.name || leave.user?.email}`
      }
    );

    const io = getIO(); 

    const employeeId = leave.user._id.toString();
console.log("📡 Sending approval to employee:", employeeId);

    io.to(employeeId).emit("new_notification", {
      type: `leave-${status}`,
      title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your leave request has been ${status} ${status === 'approved' ? '✅' : '❌'}`,
});

console.log("✅ Approval emitted to employee");

    res.json({ message: `Leave ${status} successfully`, leave });
  } catch (error) {
    logger.error("Update leave status failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
// BULK UPDATE LEAVE STATUS (Used by Admin/Manager)
// ------------------------------------------------
exports.bulkUpdateLeaveStatus = async (req, res) => {
  try {
    const { leaveIds, status, managerRemarks } = req.body;
    const approverId = req.user.userId || req.user._id;
    const slug = req.organization.slug; // Set by tenant middleware

    logger.info("Bulk update leave status request", { leaveIds, status, approverId });

    if (!Array.isArray(leaveIds) || leaveIds.length === 0) {
      return res.status(400).json({ message: "leaveIds array is required" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
    }

    // Fetch leaves so we can notify employees individually
    const leaves = await Leave.find({ _id: { $in: leaveIds }, slug });

    const result = await Leave.updateMany(
      { _id: { $in: leaveIds }, slug },
      { 
        status, 
        managerRemarks,
        approvedBy: approverId,
        actionDate: new Date()
      }
    );

    console.log(chalk.yellow(`⚙ Bulk Leave ${status} → ${result.modifiedCount} requests`));
    
    try {
      const io = getIO();
      leaves.forEach(leave => {
        io.to(leave.user.toString()).emit("new_notification", {
          title: "Leave Status Updated",
          message: `Your leave request has been ${status}`,
        });
      });
    } catch (err) {
      logger.error("Bulk update emit failed", err);
    }

    res.json({ message: `Successfully updated ${result.modifiedCount} leave(s) to ${status}`, modifiedCount: result.modifiedCount });
  } catch (error) {
    logger.error("Bulk update leave status failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
// CANCEL LEAVE (Used by User/Employee)
// ------------------------------------------------
exports.cancelLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const userId = req.user.userId || req.user._id;
    const slug = req.organization.slug; // Set by tenant middleware

    logger.info("Cancel leave request", { leaveId, userId });

    const leave = await Leave.findOne({ _id: leaveId, user: userId, slug });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ message: `Cannot cancel a leave that is already ${leave.status}` });
    }

    leave.status = "cancelled";
    await leave.save();

    console.log(chalk.red(`⛔ Leave cancelled → User:${userId}`));
    
    await Activity.findOneAndUpdate(
      { referenceId: leaveId, referenceModel: "Leave" },
      { 
        action: "Leave Cancelled", 
        message: `Leave cancelled by ${leave.name || 'user'}`
      }
    );

    try {
      const io = getIO();
      const admins = await User.find({ organization: slug, role: { $in: ['admin', 'owner', 'manager'] } });
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit("new_notification", {
          title: "Leave Cancelled",
          message: `Leave cancelled by ${leave.name || 'user'}`
        });
      });
    } catch (err) {
      logger.error("Socket emit failed", err);
    }

    res.json({ message: "Leave cancelled successfully", leave });
  } catch (error) {
    logger.error("Cancel leave failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
// UPDATE LEAVE (Used by User/Employee)
// ------------------------------------------------
exports.updateLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { type, fromDate, toDate, reason, attachments, session, emergency } = req.body;
    const userId = req.user.userId || req.user._id;
    const slug = req.organization.slug; // Set by tenant middleware

    logger.info("Update leave request", { leaveId, userId });

    const leave = await Leave.findOne({ _id: leaveId, user: userId, slug });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ message: `Cannot update a leave that is already ${leave.status}` });
    }

    leave.leaveType = type || leave.leaveType;
    leave.startDate = fromDate || leave.startDate;
    leave.endDate = type === "half-day" ? fromDate : (toDate || leave.endDate);
    leave.reason = reason || leave.reason;
    
    if (attachments !== undefined) {
      let processedAttachments = [];
      if (typeof attachments === "string") {
        try {
          const parsed = JSON.parse(attachments);
          processedAttachments = Array.isArray(parsed) ? parsed : [attachments];
        } catch (e) {
          processedAttachments = [attachments];
        }
      } else if (Array.isArray(attachments)) {
        processedAttachments = attachments;
      }
      leave.attachments = processedAttachments.filter((item) => typeof item === "string" && item.trim() !== "");
    }
    if (session) leave.session = session;
    if (emergency !== undefined) leave.emergency = emergency;

    await leave.save();

    console.log(chalk.blue(`✎ Leave updated → User:${userId}`));
    
    await Activity.findOneAndUpdate(
      { referenceId: leaveId, referenceModel: "Leave" },
      { 
        action: "Leave Updated", 
        message: `Leave request updated by ${leave.name || 'user'}`
      }
    );

    try {
      const io = getIO();
      const admins = await User.find({ organization: slug, role: { $in: ['admin', 'owner', 'manager'] } });
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit("new_notification", {
          title: "Leave Updated",
          message: `Leave request updated by ${leave.name || 'user'}`
        });
      });
    } catch (err) {
      logger.error("Socket emit failed", err);
    }

    res.json({ message: "Leave updated successfully", leave });
  } catch (error) {
    logger.error("Update leave failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------
// DELETE LEAVE (Used by User/Employee)
// ------------------------------------------------
exports.deleteLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const userId = req.user.userId || req.user._id;
    const slug = req.organization.slug; // Set by tenant middleware

    logger.info("Delete leave request", { leaveId, userId });

    const leave = await Leave.findOneAndDelete({ _id: leaveId, user: userId, slug });

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    console.log(chalk.red(`🗑 Leave deleted → User:${userId}`));
    
    await Activity.deleteMany({ referenceId: leaveId, referenceModel: "Leave" });
    
    try {
      const io = getIO();
      const admins = await User.find({ organization: slug, role: { $in: ['admin', 'owner', 'manager'] } });
      admins.forEach(admin => {
        io.to(admin._id.toString()).emit("new_notification", {
          title: "Leave Deleted",
          message: `A leave request was deleted by the user.`
        });
      });
    } catch (err) {
      logger.error("Socket emit failed", err);
    }

    res.json({ message: "Leave deleted successfully", leave });
  } catch (error) {
    logger.error("Delete leave failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};
