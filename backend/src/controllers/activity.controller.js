const Activity = require("../models/Activity");
const Organization = require("../models/Organization.model.js");

exports.getRecentActivities = async (req, res) => {
  try {
    const { slug } = req.params;
    const org = await Organization.findOne({ slug });

    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Fetch the 10 most recent activities
    const activities = await Activity.find({ organization: org._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name imageUrl");

    res.status(200).json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Server error fetching activities" });
  }
};