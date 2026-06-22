const mongoose = require('mongoose');

const salesRepSchema = new mongoose.Schema({
  tenantId: { 
    type: String, 
    required: true,
    index: true
  }, 
  
  // 1. Basic Info
  // employeeId: { type: String, required: true }, // Maps to employeeCode on frontend
  // fullName: { type: String, required: true },
  // displayName: { type: String },
  // gender: { type: String },
  // dob: { type: Date },
  // joiningDate: { type: Date, required: true },
  memberId:{
 type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  },
  designation: { type: String, required: true },
  // reportingManager: { type: String },
  
  // 2. Contact Info
  // mobileNumber: { type: String, required: true }, // Maps to phone on frontend
  // altMobileNumber: { type: String },
  // email: { type: String, required: true },
  // altEmail: { type: String },
  // addressLine1: { type: String },
  // addressLine2: { type: String },
  // city: { type: String },
  // state: { type: String },
  // country: { type: String },
  // postalCode: { type: String },

  // 3. Employment Info
  // employeeType: { type: String },
  // employmentStatus: { type: String, default: "Active" }, 
  salesTerritory: { type: String }, // Maps to territory on frontend
  team: { type: String },
  commissionPercentage: { type: Number, default: 0 },
  monthlyTarget: { type: Number, default: 0 },
  quarterlyTarget: { type: Number, default: 0 },
  annualTarget: { type: Number, default: 0 },

  // System Computed Stats
  achievement: { type: Number, default: 0 },
  customersAssigned: { type: Number, default: 0 },
  leadsAssigned: { type: Number, default: 0 },
  ordersHandled: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 },

  // 4. Banking Info
  // bankName: { type: String },
  // accountNumber: { type: String },
  // ifscCode: { type: String },
  // upiId: { type: String },

  // 5. Performance Settings
  salesTargetEnabled: { type: Boolean, default: false },
  monthlyLeadTarget: { type: Number, default: 0 },
  monthlyConvTarget: { type: Number, default: 0 },
  monthlyRevTarget: { type: Number, default: 0 },
  incentiveScheme: { type: String },

  // 6. Login & Access
  // loginAccessEnabled: { type: Boolean, default: false },
  // username: { type: String },
  // userRole: { type: String },
  // permissions: [{ type: String }],

  // 7. Notes
  internalNotes: { type: String },
  remarks: { type: String },

  // 8. Uploads
  // profileImage: { type: String }, // Maps to avatarUrl on frontend
  // documents: [{ type: String }],

}, { timestamps: true });

module.exports = mongoose.model('SalesRep', salesRepSchema);