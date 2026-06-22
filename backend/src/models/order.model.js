const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  sku: { type: String },
  productName: { type: String },
  stock: { type: Number },
  retailPrice: { type: Number },
  costPrice: { type: Number },
  sellingPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  discountPct: { type: Number, default: 0 },
  taxPct: { type: Number, default: 0 },
  lineTotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  tenantId: { type: String, required: false, index: true },
  
  // 1. Order Info
  orderNumber: { type: String, required: true, unique: true },
  salesOwner: { type: String, required: true },
  salesRepAvatar: { type: String }, // Optional, for frontend UI display
  orderDate: { type: Date, required: true },
  deliveryDate: { type: Date, required: true },
  status: { type: String, enum: ['Draft', 'Pending', 'Pending Approval', 'Approved', 'Processing', 'Awaiting Payment', 'Awaiting Dispatch', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'On Hold'], default: 'Draft' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },

  // 2. Customer Info
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String },
  contactPerson: { type: String },
  phone: { type: String },
  email: { type: String },
  billingAddress: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  sameAsBilling: { type: Boolean, default: true },

  // 3. Items & Summary
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  summaryDiscount: { type: Number, default: 0 },
  summaryTax: { type: Number, default: 0 },
  shippingCharges: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true }, // Equivalent to 'orderValue'

  // 4. Payment, Delivery & Workflow
  paymentTerms: { type: String },
  paymentMethod: { type: String },
  advancePayment: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
  deliveryMethod: { type: String },
  deliveryInstructions: { type: String },
  trackingNumber: { type: String },
  expectedDeliveryDate: { type: Date },
  deliveryStatus: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
  internalNotes: { type: String },
  customerNotes: { type: String },
  requiresApproval: { type: Boolean, default: false },
  approver: { type: String },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'N/A'], default: 'N/A' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);