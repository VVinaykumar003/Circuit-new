// const mongoose = require('mongoose');

// const payrollSchema = new mongoose.Schema({
//   organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
//   employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
//   month: { type: Number, required: true, min: 1, max: 12 },
//   year: { type: Number, required: true },
  
//   basicSalary: { type: Number, required: true, default: 0 },
//   allowances: { type: Number, default: 0 },
//   deductions: { type: Number, default: 0 },
//   bonus: { type: Number, default: 0 },
  
//   netSalary: { type: Number, required: true },
  
//   status: { 
//     type: String, 
//     enum: ['PENDING', 'PROCESSED', 'PAID'], 
//     default: 'PENDING' 
//   },
  
//   paidAt: { type: Date },
//   generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
// }, { timestamps: true });

// // Prevent duplicate payroll records for the same employee, month, year, and organization
// payrollSchema.index({ organization: 1, employee: 1, month: 1, year: 1 }, { unique: true });

// // Pre-validate hook to automatically calculate netSalary
// payrollSchema.pre('validate', function() {
//   const basic = this.basicSalary || 0;
//   const additions = (this.allowances || 0) + (this.bonus || 0);
//   this.netSalary = basic + additions - (this.deductions || 0);
// });

// module.exports = mongoose.model('Payroll', payrollSchema);