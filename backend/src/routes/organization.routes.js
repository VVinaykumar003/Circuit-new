const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");
const organizationController = require("../controllers/Organization.controller");

//create organization 
router.post("/organization",auth,organizationController.createOrganization)

// Get current organization details
router.get("/:slug/organization", auth, tenant, organizationController.getOrganization);

// Update organization details
router.put("/:slug/organization", auth, tenant, organizationController.updateOrganization);

// Deactivate organization (Soft Delete)
router.delete("/:slug/organization", auth, tenant, organizationController.deactivateOrganization);

module.exports = router;