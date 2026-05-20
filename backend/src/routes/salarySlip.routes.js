const express = require('express');
const {
  getSalarySlipById,
  downloadSalarySlipPDF,
  getMySalarySlips,
  getAllSalarySlips,
} = require('../controllers/salarySlip.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
const tenant = require('../middlewares/tenant.middleware.js');
const { restrictTo } = authMiddleware;

const router = express.Router();

// --- EMPLOYEE ROUTE ---
// GET /api/salary-slip/:slug/my
router.get('/:slug/my', authMiddleware, tenant, getMySalarySlips);

// --- ADMIN / MANAGER ROUTES ---
// GET /api/salary-slip/:slug
router.get('/:slug', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), getAllSalarySlips);

// --- ROUTES FOR SPECIFIC SLIP (BOTH ADMIN AND EMPLOYEE) ---
router.get('/:slug/:payrollId', authMiddleware, tenant, getSalarySlipById);
router.get('/:slug/:payrollId/pdf', authMiddleware, tenant, downloadSalarySlipPDF);

module.exports = router;