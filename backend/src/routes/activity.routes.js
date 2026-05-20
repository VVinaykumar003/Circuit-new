const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activity.controller");

// GET /api/activity/:slug
router.get("/:slug", activityController.getRecentActivities);

module.exports = router;