const express = require('express');
const router = express.Router();
const { createCase, getCases, getCaseById, updateCase, deleteCase } = require('../controllers/case.controller');
const auth = require('../middlewares/auth.middleware');
const tenant = require('../middlewares/tenant.middleware');
const requireRole = require('../middlewares/role.middleware');

const allowedRoles = ['admin', 'owner', 'manager', 'sales_rep'];

router.post('/:slug/cases', auth, tenant, requireRole(allowedRoles), createCase);
router.get('/:slug/cases', auth, tenant, requireRole(allowedRoles), getCases);
router.get('/:slug/cases/:id', auth, tenant, requireRole(allowedRoles), getCaseById);
router.put('/:slug/cases/:id', auth, tenant, requireRole(allowedRoles), updateCase);
router.delete('/:slug/cases/:id', auth, tenant, requireRole(allowedRoles), deleteCase);

module.exports = router;