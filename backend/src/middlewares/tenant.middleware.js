// const logger = require("../common/libs/logger");

// /**
//  * Tenant Middleware
//  * Ensures that the authenticated user belongs to a valid tenant (Organization).
//  * Must be placed AFTER the auth middleware.
//  */
// const tenantMiddleware = (req, res, next) => {
//   // 1. Check if user exists (Auth middleware should have populated this)
//   if (!req.user) {
//     logger.warn("[TenantMiddleware] Missing req.user. Ensure auth middleware runs first.");
//     return res.status(401).json({ message: "Authentication required for tenant access" });
//   }

//   // 2. Validate Tenant ID
//   if (!req.user.tenantId) {
//     logger.error(`[TenantMiddleware] User ${req.user._id} has no linked Organization.`);
//     return res.status(403).json({ message: "Access denied: No organization associated with this user." });
//   }

//   // 3. Tenant ID is already set on req.user.tenantId by auth middleware, but we ensure it's propagated if needed
//   req.tenantId = req.user.tenantId;

//   next();
// };

// module.exports = tenantMiddleware;

const Organization = require("../models/Organization.model");
const logger = require("../common/libs/logger");

module.exports = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Organization slug is required",
      });
    }

    const org = await Organization.findOne({ slug: slug.toLowerCase() });

    if (!org) {
      logger.warn("Tenant not found for slug", { slug });
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    // If request has an authenticated user, enforce tenant isolation
    if (
      req.user &&
      req.user.organization &&
      req.user.role !== "super_admin" &&
      req.user.organization.toString() !== org._id.toString()
    ) {
      logger.warn("Tenant isolation violation attempt", {
        userId: req.user._id,
        userOrg: req.user.organization,
        targetOrg: org._id,
      });

      return res.status(403).json({
        success: false,
        message: "Access denied: You do not have access to this organization",
      });
    }

    req.organization = org;
    req.tenantId = org._id;

    next();
  } catch (error) {
    logger.error("Tenant middleware error", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Server error resolving organization",
    });
  }
};