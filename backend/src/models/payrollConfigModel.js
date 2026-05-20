const mongoose = require('mongoose');

const payrollConfigSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },

  basicPercent: {
    type: Number,
    default: 0,
  },

  // hraPercent: {
  //   type: Number,
  //   default: 0,
  // },

  // daPercent: {
  //   type: Number,
  //   default: 0,
  // },

}, { timestamps: true });

const PayrollConfig = mongoose.model("PayrollConfig", payrollConfigSchema);

module.exports = PayrollConfig;