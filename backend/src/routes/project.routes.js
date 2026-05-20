const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const projectController = require("../controllers/project.controller");
const tenant = require("../middlewares/tenant.middleware");

router.post("/:slug/createProject", auth, tenant, projectController.createProject);
router.get("/:slug/getProjects", auth, tenant, projectController.getProjects); 
router.put("/:slug/editProject/:projectId",auth, tenant, projectController.editProject);
router.delete("/:slug/deleteProject/:projectId", auth, tenant, projectController.deleteProject);
router.get("/:slug/getProjectParticipants/:projectId", auth, tenant, projectController.getProjectParticipants);
router.get("/:slug/getProjectById/:projectId", auth, tenant, projectController.getProjectById);
module.exports = router;
