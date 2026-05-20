const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");
const leavePolicyController = require("../controllers/LeavePolicy.controller");

router.get(
  "/:slug/leave-policy",
  auth,
  tenant,
  leavePolicyController.getPolicy
);

router.put(
  "/:slug/leave-policy",
  auth,
  tenant,
  leavePolicyController.updatePolicy
);

module.exports = router;