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
  getOrganizationAttendance,
  // Import new controller functions
  getEmployeeDashboard,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getAttendanceHistory,
  applyRegularization,
  getAdminDashboard
} = require('../controllers/attendance.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
const tenant = require('../middlewares/tenant.middleware.js');
const { restrictTo } = authMiddleware;

const router = express.Router();

// --- DEPRECATED/LEGACY MANAGER-LED FLOW ---
router.post('/:slug/mark-attendance', authMiddleware, tenant, markDepartmentAttendance);
router.get('/:slug/attendance', authMiddleware, tenant, getAttendanceByDepartment);
router.get('/:slug/attendance/summary', authMiddleware, tenant, getEmployeeAttendanceSummary);

// --- NEW EMPLOYEE-CENTRIC ATTENDANCE FLOW ---

// --- Employee Self-Service Routes ---
router.get('/:slug/attendance/today', authMiddleware, tenant, getEmployeeDashboard); // Corresponds to getEmployeeDashboard
router.post('/:slug/attendance/check-in', authMiddleware, tenant, checkIn); // Corresponds to checkIn
router.post('/:slug/attendance/check-out', authMiddleware, tenant, checkOut); // Corresponds to checkOut
router.post('/:slug/attendance/start-break', authMiddleware, tenant, startBreak); // Corresponds to startBreak
router.post('/:slug/attendance/end-break', authMiddleware, tenant, endBreak); // Corresponds to endBreak
router.get('/:slug/attendance/history', authMiddleware, tenant, getAttendanceHistory); // Corresponds to getAttendanceHistory
router.post('/:slug/attendance/regularization', authMiddleware, tenant, applyRegularization); // Corresponds to applyRegularization

// --- Admin/Manager Actions ---
router.post('/:slug/attendance/mark', authMiddleware, tenant, markAttendance); // Employee marks own attendance (PENDING)
router.get('/:slug/attendance/my', authMiddleware, tenant, getMyAttendance); // Employee views own attendance
router.put('/:slug/attendance/approve/:attendanceId', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), approveAttendance); // Admin approves
router.get('/:slug/attendance/organization', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), getOrganizationAttendance); // Admin views all

// --- General & Utility Routes ---
router.put('/:slug/attendance/:attendanceId', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), updateAttendance);
router.get('/:slug/attendance/manager-departments', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), getManagerDepartments);
router.get('/:slug/attendance/all-employees', authMiddleware, tenant, restrictTo('owner', 'admin'), getAllEmployees);
router.get('/:slug/attendance/department-employees', authMiddleware, tenant, getDepartmentEmployees);

// --- Admin Specific Endpoints (could be in a separate admin route file) ---
// Note: The frontend service uses a different base URL for these.
// To match it, you might create a new router file mounted at '/api/admin/attendance'.
router.get('/:slug/admin/', authMiddleware, tenant, getAdminDashboard); // This one is correct for the admin dashboard data
// The approve/reject actions will use the main '/:slug/attendance/approve/:attendanceId' route.

module.exports = router;
