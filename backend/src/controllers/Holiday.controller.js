const Holiday = require("../models/Holiday.model");
const logger = require("../common/libs/logger");

exports.addHoliday = async (req, res) => {
  try {
    const { date, title, description } = req.body;
    const slug = req.organization.slug;
    const createdBy = req.user.userId || req.user._id;

    const holiday = await Holiday.create({
      slug,
      date,
      title,
      description,
      createdBy,
    });

    logger.info("Holiday added successfully", { date, title });
    res.status(201).json({ message: "Holiday published successfully", holiday });
  } catch (error) {
    logger.error("Add holiday failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { holidayId } = req.params;
    const slug = req.organization.slug;

    const holiday = await Holiday.findOneAndUpdate(
      { _id: holidayId, slug },
      { title, description },
      { new: true }
    );

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    logger.info("Holiday updated successfully", { holidayId, title });
    res.json({ message: "Holiday updated successfully", holiday });
  } catch (error) {
    logger.error("Update holiday failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const slug = req.organization.slug;

    const holiday = await Holiday.findOneAndDelete({ _id: holidayId, slug });

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    logger.info("Holiday deleted successfully", { holidayId });
    res.json({ message: "Holiday deleted successfully", holiday });
  } catch (error) {
    logger.error("Delete holiday failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

exports.getHolidays = async (req, res) => {
  try {
    const slug = req.organization.slug;
    
    // Fetch all holidays for the organization, sorted by date
    const holidays = await Holiday.find({ slug }).sort({ date: 1 });
    
    res.json({
      message: "Holidays retrieved successfully",
      holidays,
    });
  } catch (error) {
    logger.error("Get holidays failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};