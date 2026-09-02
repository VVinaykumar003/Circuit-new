const Forecast = require('../models/forecast.model');

/**
 * Create a new sales forecast
 * POST /api/sales/forecast
 */
const createForecast = async (req, res) => {
  try {
    const raw = req.body || {};
    const orgId = req.organization?._id || req.tenantId;
    const now = new Date();
    
    const forecastData = {
      ...raw,
      tenantId: orgId,
      forecastName: raw.forecastName || `Sales Forecast ${raw.period || now.getFullYear()}`,
      forecastType: raw.forecastType || "Revenue",
      period: {
        startDate: raw.period?.startDate || raw.startDate || now,
        endDate: raw.period?.endDate || raw.endDate || new Date(now.getTime() + 86400000 * 90),
      },
      forecastYear: raw.forecastYear || now.getFullYear(),
      salesRegion: raw.salesRegion || "Global",
      forecastRevenue: Number(raw.forecastRevenue || raw.projectedRevenue || 100000),
      targetRevenue: Number(raw.targetRevenue || raw.forecastRevenue || raw.projectedRevenue || 100000),
      forecastMethod: raw.forecastMethod || "Qualitative",
    };

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
 * GET /api/forecast
 */
const getForecasts = async (req, res) => {
  try {
    const orgId = req.organization?._id || req.tenantId;
    const match = orgId ? { $or: [{ tenantId: orgId }, { tenantId: { $exists: false } }, { tenantId: null }] } : {};
    
    const forecasts = await Forecast.find(match).sort({ createdAt: -1 });
    
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