const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    leaveType: {
      type: String,
      enum: ["casual", "sick", "paid", "maternity", "paternity", "half-day", "other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: String, // Typically stores the file URL or file path after upload
      }
    ],
    session: {
      type: String,
      enum: ["first-half", "second-half"],
    },
    emergency: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    managerRemarks: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    actionDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);