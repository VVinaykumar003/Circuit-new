const express = require('express');
const { getSalesDashboardData } = require('../controllers/salesController.js');
const auth = require('../middlewares/auth.middleware');
const tenant = require('../middlewares/tenant.middleware');

const router = express.Router({ mergeParams: true });

// Route: GET /api/sales/:slug/dashboard
router.get("/:slug/dashboard", auth, tenant, getSalesDashboardData);

module.exports = router;