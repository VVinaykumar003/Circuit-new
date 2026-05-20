const LeavePolicy = require("../models/LeavePolicy.model");
const logger = require("../common/libs/logger");

exports.getPolicy = async (req, res) => {
  try {
    const slug = req.organization.slug;

    logger.info("Fetching leave policy", { slug });
    
    let policy = await LeavePolicy.findOne({ slug });
    logger.info("Leave policy fetched successfully", { policy });
    
    // Auto-create default policy if it doesn't exist yet
    if (!policy) {
      policy = await LeavePolicy.create({ slug });
    }
    
    res.json({ policy });
  } catch (error) {
    logger.error("Get leave policy failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const slug = req.organization.slug;
    logger.info("Updating leave policy", { slug, body: req.body });
    const { casual, sick, paid } = req.body;
    logger.info("Parsed leave policy data", { casual, sick, paid });
    const userId = req.user.userId || req.user._id;
    logger.info("Updating leave policy by user", { userId });

    const policy = await LeavePolicy.findOneAndUpdate(
      { slug },
      { casual, sick, paid, updatedBy: userId },
      { new: true, upsert: true }
    );
    logger.info("Leave policy updated successfully", { policy });

    res.json({ message: "Leave policy updated successfully", policy });
  } catch (error) {
    logger.error("Update leave policy failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};