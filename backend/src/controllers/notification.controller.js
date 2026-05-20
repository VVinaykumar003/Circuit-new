
const User = require("../models/User.model");
const { cloudinary } = require("../config/cloudinary");
const streamifier = require("streamifier");
const NotificationModel = require("../models/Notification.model");
const { getIO } = require("../services/socket.service.js");
const sendNotification = async (req, res) => {
  try {
    const { title, message, priority, sendTo, recipients } = req.body;

    const organization = req.organization._id;
    const createdBy = req.user._id;

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    let finalRecipients = [];

    // 🟢 All employees
    if (sendTo === "all") {
      const users = await User.find({ organization }).select("_id");
      finalRecipients = users.map((u) => u._id);
    }

    // 🔵 Specific users
    if (sendTo === "specific") {
      if (!recipients || recipients.length === 0) {
        return res.status(400).json({
          message: "Recipients required",
        });
      }
      finalRecipients = recipients;
    }

    // 📎 Upload attachments (same as addTask)
    const files = req.files || [];
    const uploadedAttachments = [];

    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "notifications" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploadedAttachments.push({
        fileUrl: result.secure_url,
        fileName: file.originalname,
        fileType: file.mimetype,
      });
    }

    const notification = await NotificationModel.create({
      title,
      message,
      priority: priority || "normal",
      sendTo: sendTo || "all",
      recipients: finalRecipients,
      attachments: uploadedAttachments,
      organization,
      createdBy,
    });

    // Emit Realtime Notification via socket.io
    try {
      const io = getIO();
      finalRecipients.forEach(recipientId => {
        io.to(recipientId.toString()).emit("new_notification", notification);
      });
    } catch (err) {
      console.error("Socket emit failed for custom notification", err);
    }

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notification,
    });

  } catch (error) {
    console.error("❌ Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}; 


const getNotifications = async (req, res) => {
  try {
    const organization = req.organization._id;
    const userId = req.user._id; 


    const notifications = await NotificationModel.find({
      organization,
      $or: [
        { sendTo: "all" },
        { recipients: userId }
      ]
    })
      .sort({ createdAt: -1 }) 
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });

  } catch (error) {
    console.error("Get Notifications Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};


const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, priority, sendTo, recipients } = req.body;

    const notification = await NotificationModel.findById(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // 🔐 Only admin / owner
    if (!["admin", "owner"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const organization = req.organization._id;

    let finalRecipients = notification.recipients;

    // 🟢 All employees
    if (sendTo === "all") {
      const users = await User.find({ organization }).select("_id");
      finalRecipients = users.map((u) => u._id);
    }
 
    // 🔵 Specific users
    if (sendTo === "specific") {
      if (!recipients || recipients.length === 0) {
        return res.status(400).json({
          message: "Recipients required",
        });
      }
      finalRecipients = recipients;
    }

    // Handle attachments 
    let uploadedAttachments = notification.attachments || [];

    const files = req.files || [];

    if (files.length > 0) {
      uploadedAttachments = [];

      for (const file of files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "notifications" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        uploadedAttachments.push({
          fileUrl: result.secure_url,
          fileName: file.originalname,
          fileType: file.mimetype,
        });
      }
    }

    //  Update fields
    notification.title = title || notification.title;
    notification.message = message || notification.message;
    notification.priority = priority || notification.priority;
    notification.sendTo = sendTo || notification.sendTo;
    notification.recipients = finalRecipients;
    notification.attachments = uploadedAttachments;

    await notification.save();

    res.json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });

  } catch (error) {
    console.error("Update Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await NotificationModel.findById(id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    // 🔐 Only admin / owner
    if (!["admin", "owner"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });

  } catch (error) {
    console.error("Delete Notification Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user._id;

    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: userId } }, //  prevents duplicate IDs
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, data: notification });
  } catch (error) {
    console.error("Mark as Read Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark all notifications as read for the current user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    await NotificationModel.updateMany(
      { 
        organization: req.organization._id,
        readBy: { $ne: userId } // Only update documents the user hasn't read yet
      },
      { $addToSet: { readBy: userId } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark All As Read Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


module.exports = {
  sendNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
  markAllAsRead,
  markAsRead
};
  