const express = require('express');
const router = express.Router();
const { createForecast, getForecasts } = require('../controllers/forecastController');
const auth = require('../middlewares/auth.middleware');
const tenant = require('../middlewares/tenant.middleware');

// Maps to /api/forecast
router.post('/:slug/create-forecast', auth, tenant, createForecast);
router.get('/:slug/get-forecasts', auth, tenant, getForecasts);

module.exports = router;