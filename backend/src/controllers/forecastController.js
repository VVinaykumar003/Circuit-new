const Forecast = require('../models/forecast.model');

/**
 * Create a new sales forecast
 * POST /api/sales/forecast
 */
const createForecast = async (req, res) => {
  try {
    const forecastData = req.body;
    
    // If your app is multi-tenant, you can extract tenantId here
    // forecastData.tenantId = req.organization?._id || req.tenantId;

    const newForecast = new Forecast(forecastData);
    await newForecast.save();
    
    return res.status(201).json({
      success: true,
      data: newForecast,
      message: 'Forecast created successfully'
    });
  } catch (error) {
    console.error('Error creating forecast:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create forecast',
      error: error.message
    });
  }
};

/**
 * Retrieve all forecasts
 * GET /api/sales/forecast
 */
const getForecasts = async (req, res) => {
  try {
    // const tenantId = req.organization?._id || req.tenantId;
    // const match = tenantId ? { tenantId } : {};
    
    const forecasts = await Forecast.find().sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      data: forecasts
    });
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch forecasts',
      error: error.message
    });
  }
};

module.exports = {
  createForecast,
  getForecasts
};