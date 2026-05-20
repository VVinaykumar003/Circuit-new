const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

  attachments: [
      {
        fileUrl: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
        },
        fileType: {
          type: String,
        },
      },
    ], 


    priority: {
      type: String,
      enum: ["low", "normal", "urgent"],
      default: "normal",
    },

    sendTo: {
      type: String,
      enum: ["all", "specific"],
      default: "all",
    },

    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // used when sendTo = "specific"

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    createdBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);