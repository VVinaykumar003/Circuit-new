const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");

const taskController = require("../controllers/task.controller");
const { upload } = require("../middlewares/upload");
router.post(
  "/:slug/addTasks/:projectId",
  auth,
  tenant,
  upload.array("attachments"),
  taskController.addTask,
);
router.put(
  "/:slug/updateTask/:projectId/:taskId",
  auth,
  tenant,
  upload.array("attachments"),
  taskController.updateTask,
);

router.delete(
  "/:slug/deleteTask/:projectId/:taskId",
  auth,
  tenant,
  taskController.deleteTask,
);
router.get(
  "/:slug/getTasks",
  auth,
  tenant,
  taskController.getTasks
);
router.get("/:slug/getTasks/:projectId", auth, tenant, taskController.getTasks);
// All tasks (dashboard)
router.get("/:slug/getTasks", auth, tenant, taskController.getTasks);


router.patch(
  "/:slug/updateTaskStatus/:projectId/:taskId",
  auth,
  tenant,
  taskController.updateTaskStatus,
);
router.patch(
  "/:slug/updateSubtaskStatus/:projectId/:taskId/:subtaskId",
  auth,
  tenant,
  taskController.updateSubtaskStatus,
);

module.exports = router;
