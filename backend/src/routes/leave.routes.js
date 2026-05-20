const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");
const leaveController = require("../controllers/Leave.controller");

// All leave routes require authentication and tenant context
// The :slug param is used by the tenant middleware to set req.organization

// User/Employee Routes
router.post(
  "/:slug/leaves/apply",
  auth,
  tenant,
  leaveController.applyLeave
);

router.get(
  "/:slug/leaves/my",
  auth,
  tenant,
  leaveController.getMyLeaves
);

router.patch(
  "/:slug/leaves/:leaveId/cancel",
  auth,
  tenant,
  leaveController.cancelLeave
);

// Admin/Manager Routes
router.get(
  "/:slug/leaves/all",
  auth,
  tenant,
  leaveController.getAllLeaves
);

router.patch(
  "/:slug/leaves/bulk-status",
  auth,
  tenant,
  leaveController.bulkUpdateLeaveStatus
);

router.get(
  "/:slug/leaves/:leaveId",
  auth,
  tenant,
  leaveController.getLeaveById
);

router.patch(
  "/:slug/leaves/:leaveId/status",
  auth, 
  tenant,
  leaveController.updateLeaveStatus
);
router.put(
  "/:slug/leaves/:leaveId",
  auth,
  tenant,
  leaveController.updateLeave
)
router.delete(
  "/:slug/leaves/:leaveId",
  auth,
  tenant,
  leaveController.deleteLeave
);

module.exports = router;
