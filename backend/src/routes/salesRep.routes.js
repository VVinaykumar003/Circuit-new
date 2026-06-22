const express = require('express');
const router = express.Router({ mergeParams: true });
const salesRepController = require('../controllers/salesRep.controller');

// Assuming your main app mounts this router with something like:
// app.use('/api/:slug/sales-reps', salesRepRoutes); 
// Or if mounted directly, these use the standard pattern seen in your API files.

router.post('/:slug/create-sales-rep', salesRepController.createSalesRep);
router.get('/:slug/get-all-sales-reps', salesRepController.getAllSalesReps);
router.get('/:slug/get-sales-reps/:id', salesRepController.getSalesRepById);
router.put('/:slug/get-sales-reps/:id', salesRepController.updateSalesRep);
router.delete('/:slug/get-sales-reps/:id', salesRepController.deleteSalesRep);

module.exports = router;