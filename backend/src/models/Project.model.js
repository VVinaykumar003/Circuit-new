const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["Member", "Manager"],
      required: true,
    },

    responsibility: {
      type: String,
      enum: [
        "Frontend Development",
        "Backend Development",
        "Full Stack Development",
        "Debugging",
        "Content",
        "Research",
        "Maintain",

        "UI Design",

        "Testing",
        "Deployment",
      ],
      required: true,
    },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    projectState: {
      type: String,
      enum: ["Active", "Completed", "On Hold"],
      default: "Active",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
    },

    domain: {
      type: String,
      enum: [
        "Web Development",
        "App Development",
        "AI/ML",
        "Social Media",
        "Block Chain",
        "Content Creation",
        "Content Writing",
        "Testing",
        "Software Development",

        "Other",
      ],
      required: true,
    },

    customDomain: {
      type: String,
      default: "",
    },

    description: {
      type: String,
    },

    participants: [participantSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Project", projectSchema);
