const express = require('express');
const router = express.Router();
const { createForecast, getForecasts } = require('../controllers/forecastController');

// Maps to /api/sales/forecast
router.post('/:slug/create-forecast', createForecast);
router.get('/:slug/get-forecasts', getForecasts);

module.exports = router;