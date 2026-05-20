const mongoose = require("mongoose");

const leavePolicySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    casual: {
      type: Number,
      default: 12,
    },
    sick: {
      type: Number,
      default: 8,
    },
    paid: {
      type: Number,
      default: 15,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeavePolicy", leavePolicySchema);