const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
   slug: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);