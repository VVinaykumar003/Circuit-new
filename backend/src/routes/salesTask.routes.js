const express = require('express');
const router = express.Router();
const { createSalesTask, getSalesTasks, getSalesTaskById, updateSalesTask, deleteSalesTask, getSalesTaskByEmpId } = require('../controllers/salesTask.controller');
const auth = require('../middlewares/auth.middleware');
const tenant = require('../middlewares/tenant.middleware');
const requireRole = require('../middlewares/role.middleware');
const allowedRoles = ['admin','owner', 'manager', 'sales_rep','employee']
console.log("ROUTE HIT");

router.post('/:slug/create-sales-task', auth, tenant, requireRole(allowedRoles), createSalesTask);
router.get("/:slug/get-task-by-empId",auth,tenant,getSalesTaskByEmpId);
router.get('/:slug/get-all-sales-tasks', auth, tenant,getSalesTasks);
router.get('/:slug/:id', auth, tenant, requireRole(allowedRoles), getSalesTaskById);
router.put('/:slug/:id', auth, tenant, requireRole(allowedRoles), updateSalesTask);
router.delete('/:slug/sales-tasks/:id', auth, tenant, requireRole(allowedRoles), deleteSalesTask);


module.exports = router;