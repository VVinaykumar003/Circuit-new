const express = require('express');
const {
  markDepartmentAttendance,
  getAttendanceByDepartment,
  updateAttendance,
  getEmployeeAttendanceSummary,
  getManagerDepartments,
  getDepartmentEmployees,
  getAllEmployees,
  markAttendance,
  approveAttendance,
  getMyAttendance,
  getOrganizationAttendance
} = require('../controllers/attendance.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
const tenant = require('../middlewares/tenant.middleware.js');
const { restrictTo } = authMiddleware;

const router = express.Router();

// Manager / Admin / Owner Routes
router.post('/:slug/mark-attendance', authMiddleware, tenant, markDepartmentAttendance);
router.put('/:slug/attendance/:attendanceId', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), updateAttendance);
router.get('/:slug/attendance/manager-departments', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), getManagerDepartments);

router.get('/:slug/attendance/all-employees', authMiddleware, tenant, restrictTo('owner', 'admin'), getAllEmployees);

// Routes for all authenticated users
router.get('/:slug/attendance', authMiddleware, tenant, getAttendanceByDepartment);
router.get('/:slug/attendance/department-employees', authMiddleware, tenant, getDepartmentEmployees);

// Employee / Payroll specific Routes
router.get('/:slug/attendance/summary', authMiddleware, tenant, getEmployeeAttendanceSummary);

// --- NEW ROLE-BASED ATTENDANCE FLOW ROUTES ---
router.post('/:slug/attendance/mark', authMiddleware, tenant, markAttendance); // Employee marks own attendance (PENDING)
router.get('/:slug/attendance/my', authMiddleware, tenant, getMyAttendance); // Employee views own attendance
router.put('/:slug/attendance/approve/:attendanceId', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), approveAttendance); // Admin approves
router.get('/:slug/attendance/organization', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), getOrganizationAttendance); // Admin views all

module.exports = router;
