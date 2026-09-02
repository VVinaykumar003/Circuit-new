const Case = require('../models/Case.model');
const mongoose = require('mongoose');

exports.createCase = async (req, res) => {
  try {
    const tenantId = req.organization._id;
    const caseData = { ...req.body };

    if (!caseData.caseNumber) {
      const count = await Case.countDocuments({ organization: tenantId });
      caseData.caseNumber = `CASE-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;
    }

    if (!caseData.type) {
      caseData.type = caseData.caseType || "Support";
    }

    if (!caseData.customer) {
      caseData.customer = caseData.company || caseData.accountName || req.user?.name || "General Customer";
    }

    if (caseData.priority) {
      const p = String(caseData.priority).toLowerCase();
      caseData.priority = p === "critical" ? "Critical" : p === "high" ? "High" : p === "low" ? "Low" : "Medium";
    }

    if (caseData.status) {
      const s = String(caseData.status).toLowerCase();
      caseData.status = s === "in progress" || s === "in-progress" ? "In Progress" : s === "closed" ? "Closed" : s === "resolved" ? "Resolved" : "Open";
    }

    const newCase = new Case({
      ...caseData,
      organization: tenantId,
    });
    const savedCase = await newCase.save();
    res.status(201).json({ success: true, data: savedCase, message: "Case created successfully" });
  } catch (error) {
    console.error("Create Case Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "A case with this number already exists." });
    }
    res.status(500).json({ success: false, message: "Failed to create case" });
  }
};

exports.getCases = async (req, res) => {
  try {
    const tenantId = req.organization._id;
    const cases = await Case.find({ organization: tenantId }).sort({ createdAt: -1 });
    console.log(`Fetched ${cases.length} cases for tenant ${tenantId}`);
    res.status(200).json({ success: true, data: cases });
  } catch (error) {
    console.error("Get Cases Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cases" });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const tenantId = req.organization._id;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid case ID format" });
    }
    const caseItem = await Case.findOne({ _id: req.params.id, organization: tenantId });
    if (!caseItem) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    res.status(200).json({ success: true, data: caseItem });
  } catch (error) {
    console.error("Get Case By Id Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateCase = async (req, res) => {
  try {
    const tenantId = req.organization._id;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid case ID format" });
    }
    const updatedCase = await Case.findOneAndUpdate(
      { _id: req.params.id, organization: tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCase) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    res.status(200).json({ success: true, data: updatedCase, message: "Case updated successfully" });
  } catch (error) {
    console.error("Update Case Error:", error);
    res.status(500).json({ success: false, message: "Failed to update case" });
  }
};

exports.deleteCase = async (req, res) => {
  try {
    const tenantId = req.organization._id;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid case ID format" });
    }
    const deletedCase = await Case.findOneAndDelete({ _id: req.params.id, organization: tenantId });
    if (!deletedCase) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }
    res.status(200).json({ success: true, message: "Case deleted successfully" });
  } catch (error) {
    console.error("Delete Case Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete case" });
  }
};