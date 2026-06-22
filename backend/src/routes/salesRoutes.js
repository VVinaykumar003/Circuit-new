const express = require('express');
// import { getSalesDashboardData } from "../controllers/salesController.js";
const { getSalesDashboardData} = require('../controllers/salesController.js');

// Use mergeParams to ensure we can access the ':slug' parameter from the parent router
const router = express.Router({ mergeParams: true });

// Route: GET /api/:slug/sales/dashboard
router.get("/:slug/dashboard", getSalesDashboardData);

module.exports = router;