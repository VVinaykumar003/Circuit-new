const express = require("express");

const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");

const memberController = require("../controllers/member.controller");


router.post("/:slug/members", auth, tenant, memberController.createEmployee);
router.get("/:slug/members", auth, tenant, memberController.getMembers);
router.get("/:slug/members/:userId", auth, tenant, memberController.getEmployeeById);
router.delete("/:slug/members/:userId", auth, tenant, memberController.deleteEmployee);
router.patch("/:slug/members/:userId", auth, tenant, memberController.updateEmployee); 

router.post("/:slug/members/invite", auth, tenant, memberController.inviteEmployee);
router.patch("/:slug/members/:userId/role", auth, tenant, memberController.updateRole);
router.patch("/:slug/members/:userId/deactivate", auth, tenant, memberController.deactivateEmployee);


module.exports = router;