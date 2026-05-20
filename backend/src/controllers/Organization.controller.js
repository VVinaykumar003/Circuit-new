const mongoose = require('mongoose');
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');
const logger = require('../common/libs/logger');

// Create a new organization
exports.createOrganization = async (req, res) => {
  try {
    const {
      organizationName,
      organizationEmail,
      ownerName,
      ownerEmail,
      registrationNumber,
      phoneNumber,
      address
    } = req.body;

    if (!organizationName || !organizationEmail || !ownerName || !ownerEmail) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Generate a simple URL-friendly slug based on the organization name
    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingOrg = await Organization.findOne({ $or: [{ slug }, { organizationEmail }] });
    if (existingOrg) {
      return res.status(400).json({ success: false, message: "Organization already exists" });
    }

    const newOrg = await Organization.create({
      organizationName, organizationEmail, ownerName, ownerEmail,
      slug, registrationNumber, phoneNumber, address
    });

    res.status(201).json({ success: true, message: "Organization created successfully", organization: newOrg });
  } catch (error) {
    logger.error("Create organization failed", { error: error.message });
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Get current organization details
exports.getOrganization = async (req, res) => {
  try {
    const orgId = req.organization._id || req.organization;
    
    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    res.json({ success: true, organization: org });
  } catch (error) {
    logger.error("Get organization failed", { error: error.message });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update organization details
exports.updateOrganization = async (req, res) => {
  try {
    const orgId = req.organization._id || req.organization;
    
    // Only allow updating specific fields
    const { organizationName, phoneNumber, address, settings } = req.body;

    // Check permissions
    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized to update organization details" });
    }

    const updatedOrg = await Organization.findByIdAndUpdate(
      orgId,
      { 
        $set: { 
          ...(organizationName && { organizationName }),
          ...(phoneNumber && { phoneNumber }),
          ...(address && { address }),
          ...(settings && { settings })
        } 
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    res.json({ success: true, message: "Organization updated successfully", organization: updatedOrg });
  } catch (error) {
    logger.error("Update organization failed", { error: error.message });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Deactivate organization (Soft Delete)
exports.deactivateOrganization = async (req, res) => {
  try {
    const orgId = req.organization._id || req.organization;

    if (req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: "Only the owner can deactivate the organization" });
    }

    const org = await Organization.findByIdAndUpdate(
      orgId,
      { isActive: false },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    res.json({ success: true, message: "Organization deactivated successfully" });
  } catch (error) {
    logger.error("Deactivate organization failed", { error: error.message });
    res.status(500).json({ success: false, message: "Server error" });
  }
};
