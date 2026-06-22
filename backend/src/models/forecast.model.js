const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }, // Included if using a multi-tenant architecture
  forecastName: { type: String, required: true },
  forecastType: { type: String, required: true },
  forecastStatus: { type: String, default: 'Draft' },
  forecastDescription: { type: String },

  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  forecastYear: { type: Number, required: true },
  forecastQuarter: { type: String },

  salesRegion: { type: String, required: true },
  salesTerritory: { type: String },
  salesTeam: { type: String },
  salesManager: { type: String },
  salesRepresentative: { type: String },
  customerSegment: { type: String },
  productCategory: { type: String },

  forecastRevenue: { type: Number, required: true },
  targetRevenue: { type: Number, required: true },
  expectedRevenue: { type: Number, default: 0 },
  minimumRevenue: { type: Number, default: 0 },
  maximumRevenue: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },

  expectedDeals: { type: Number, default: 0 },
  openOpportunities: { type: Number, default: 0 },
  expectedCustomers: { type: Number, default: 0 },
  averageDealSize: { type: Number, default: 0 },
  pipelineValue: { type: Number, default: 0 },
  expectedCloseRate: { type: Number, default: 0 },

  forecastMethod: { type: String, required: true },
  confidenceLevel: { type: Number, default: 0 },
  riskLevel: { type: String },

  businessAssumptions: { type: String },
  marketAssumptions: { type: String },
  growthExpectations: { type: String },
  challenges: { type: String },
  opportunities: { type: String },

  forecastOwner: { type: String },
  reviewer: { type: String },
  approver: { type: String },
  approvalDeadline: { type: Date },

  internalNotes: { type: String },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Forecast', forecastSchema);