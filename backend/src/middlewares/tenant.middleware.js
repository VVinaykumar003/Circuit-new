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

const divider = "----------------------------------------";

module.exports = async (req,res,next)=>{

  const { slug } = req.params;
  logger.info("Resolving tenant for organization", { slug });

  const org = await Organization.findOne({ slug });
  // logger.debug("Organization lookup result", { organization: org });
  logger.info("Tenant resolved", { tenantId: org?.slug });
  logger.info("Tenant resolved", { tenantId: org?._id });
   divider && logger.info(divider);

  if(!org) return res.status(404).json({msg:"Tenant not found"});

  req.organization = org;

  next();
};