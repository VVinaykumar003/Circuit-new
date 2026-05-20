// const express = require('express');
// const {
//   generatePayroll,
//   updatePayroll,
//   approvePayroll,
//   payPayroll,
//   getMyPayroll,
//   getAllPayroll,
//     getSalarySlipById,
//     downloadSalarySlipPDF,
// } = require('../controllers/payroll.controller.js');
// const authMiddleware = require('../middlewares/auth.middleware.js');
// const tenant = require('../middlewares/tenant.middleware.js');
// const { restrictTo } = authMiddleware;

// const router = express.Router();

// // --- EMPLOYEE ROUTES ---
// // Member (Employee) can only view their own payroll
// router.get('/:slug/my', authMiddleware, tenant, getMyPayroll);

// // --- ADMIN / MANAGER ROUTES ---
// // Admins, Owners, and Managers have privileged access to payroll management
// router.post('/:slug/generate', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), generatePayroll);
// router.get('/:slug', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), getAllPayroll);
// router.put('/:slug/:id', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), updatePayroll);
// router.put('/:slug/:id/approve', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), approvePayroll);
// router.put('/:slug/:id/pay', authMiddleware, tenant, restrictTo('owner', 'admin', 'manager'), payPayroll);
// // --- ROUTES FOR SPECIFIC SLIP (BOTH ADMIN AND EMPLOYEE) ---
// router.get('/:slug/:payrollId', authMiddleware, tenant, getSalarySlipById);
// router.get('/:slug/:payrollId/pdf', authMiddleware, tenant, downloadSalarySlipPDF);

// module.exports = router;

 const express = require('express');
const {
  getEmployeePayrollStats,
  calculateAndSetSalary,
  runMonthlyPayroll,
  getUnifiedEmployeeList,
  getPayrollSummary,
  getPayrollStructure,
  markPayrollPaid,
  getMonthlyPayroll,
  deleteDraftPayroll,
  getPayrollDetails,
  downloadSalarySlip,
  getMySalaryHistory,
  updateCompanyPayrollPolicy,
  getCompanyPayrollPolicy,
  

} = require('../controllers/admin.payroll.controller');
const{
  getPayrollConfig,
  updatePayrollConfig
}=require('../controllers/payroll.controller');
const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");

// import { protect } from '../middleware/auth.middleware.js'; // <-- Import your authentication middleware here

const router = express.Router();

// Apply authentication middleware to all routes (Uncomment when available)
// router.use(protect);

// --- Company Policy Routes ---
router.route('/:slug/policy')
  .get(getCompanyPayrollPolicy)
  .post(updateCompanyPayrollPolicy);

// --- Dashboard & Summary Routes ---
router.get('/:slug/summary', auth, tenant, getPayrollSummary);
router.get('/:slug/stats', auth, tenant, getEmployeePayrollStats);
router.get('/:slug/employees', auth, tenant, getUnifiedEmployeeList);

// --- Salary Structure Setup ---
router.post('/:slug/structure', auth, tenant, calculateAndSetSalary);
router.get('/:slug/structure/:employeeId', auth, tenant, getPayrollStructure);

// --- Monthly Payroll Processing ---
router.post('/:slug/run', auth, tenant, runMonthlyPayroll);
router.get('/:slug/monthly', auth, tenant, getMonthlyPayroll);
router.delete('/:slug/draft/:payrollId', auth, tenant, deleteDraftPayroll);

// --- Individual Payroll Slip Management ---
router.get('/:slug/slip/:slipId', auth, tenant, getPayrollDetails);
router.patch('/:slug/slip/:slipId/mark-paid', auth, tenant, markPayrollPaid);
router.get('/:slug/slip/:slipId/download', auth, tenant, downloadSalarySlip);

// --- Employee Self-Service Route ---
router.get('/:slug/my-history', auth, tenant, getMySalaryHistory);



router.get('/:slug/config', auth, tenant, getPayrollConfig);
router.patch('/:slug/config', auth, tenant, updatePayrollConfig);
module.exports = router;