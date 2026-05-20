const mongoose = require('mongoose');

const companyPolicySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
  payrollSettings: {
    basicPercent: { type: Number, default: 50 },
    hraPercent: { type: Number, default: 20 },
    daPercent: { type: Number, default: 10 }
  }
}, { timestamps: true });

// export default mongoose.model('CompanyPolicy', companyPolicySchema);
module.exports = mongoose.model('CompanyPolicy', companyPolicySchema);