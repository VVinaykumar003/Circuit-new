const express = require('express');
const router = express.Router({ mergeParams: true });
const salesRepController = require('../controllers/salesRep.controller');
const auth = require('../middlewares/auth.middleware');
const tenant = require('../middlewares/tenant.middleware');

router.post('/:slug/create-sales-rep', auth, tenant, salesRepController.createSalesRep);
router.get('/:slug/get-all-sales-reps', auth, tenant, salesRepController.getAllSalesReps);
router.get('/:slug/get-sales-reps/:id', auth, tenant, salesRepController.getSalesRepById);
router.put('/:slug/get-sales-reps/:id', auth, tenant, salesRepController.updateSalesRep);
router.delete('/:slug/get-sales-reps/:id', auth, tenant, salesRepController.deleteSalesRep);

module.exports = router;