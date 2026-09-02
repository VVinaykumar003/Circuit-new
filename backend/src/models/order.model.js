const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    // Product Reference
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Product Snapshot
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productCode: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      trim: true,
    },

    productType: {
      type: String,
      enum: ["ERP", "CRM", "SaaS", "POS", "HRMS", "Other"],
      required: true,
    },

    // Selected Plan
    planId: {
      type: String,
    },

    planName: {
      type: String,
    },

    billingCycle: {
      type: String,
      enum: ["Monthly", "Yearly", "One Time"],
    },

    // Licensing Snapshot
    licenseType: {
      type: String,
      enum: [
        "One Time",
        "Monthly",
        "Yearly",
        "Lifetime",
      ],
    },

    activationType: {
      type: String,
      enum: [
        "License Key",
        "Email",
        "Domain",
        "Device",
        "API Key",
      ],
    },

    validityDays: {
      type: Number,
      min: 0,
    },

    maxUsers: {
      type: Number,
      min: 0,
    },

    maxDevices: {
      type: Number,
      min: 0,
    },

    platformSupport: [
      {
        type: String,
        enum: [
          "windows",
          "macos",
          "linux",
          "android",
          "ios",
          "web",
        ],
      },
    ],

    // Pricing Snapshot
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    discountPct: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    taxPct: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lineSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    lineDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lineTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const orderSchema = new mongoose.Schema(
  {
    // =====================================================
    // ORGANIZATION
    // =====================================================

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // =====================================================
    // ORDER INFORMATION
    // =====================================================

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    salesOwner: {
      type: String,
      required: true,
      trim: true,
    },

    salesRepAvatar: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Pending Approval",
        "Approved",
        "Processing",
        "Awaiting Payment",
        "Completed",
        "Cancelled",
        "On Hold",
      ],
      default: "Draft",
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Urgent",
      ],
      default: "Medium",
    },

    // =====================================================
    // CUSTOMER INFORMATION
    // =====================================================

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: {
      type: String,
    },

    phone: {
      type: String,
    },

    email: {
      type: String,
    },

    billingAddress: {
      type: String,
      required: true,
    },

    // =====================================================
    // SOFTWARE DELIVERY
    // =====================================================

    deliveryType: {
      type: String,
      enum: [
        "Instant Download",
        "Email",
        "License Key",
        "Domain Activation",
        "Manual Activation",
        "Account Provisioning",
      ],
      default: "Account Provisioning",
    },

    deliveryEmail: {
      type: String,
    },

    activationDomain: {
      type: String,
    },

    // =====================================================
    // ORDER ITEMS
    // =====================================================

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one product.",
      },
    },

    // =====================================================
    // ORDER TOTALS
    // =====================================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    summaryDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    summaryTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    adjustment: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================================================
    // PAYMENT
    // =====================================================

    paymentTerms: {
      type: String,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "Credit Card",
        "UPI",
        "Bank Transfer",
        "Cheque",
        "Online",
        "Payment Gateway",
        "Other",
      ],
    },

    advancePayment: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Unpaid",
        "Partially Paid",
        "Paid",
        "Refunded",
        "Partially Refunded",
      ],
      default: "Unpaid",
    },

    paidAt: {
      type: Date,
    },

    // =====================================================
    // SOFTWARE ORDER LIFECYCLE
    // =====================================================

    provisioningStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Provisioned",
        "Failed",
      ],
      default: "Pending",
    },

    provisionedAt: {
      type: Date,
    },

    // =====================================================
    // NOTES
    // =====================================================

    internalNotes: {
      type: String,
    },

    customerNotes: {
      type: String,
    },

    // =====================================================
    // APPROVAL WORKFLOW
    // =====================================================

    requiresApproval: {
      type: Boolean,
      default: false,
    },

    approver: {
      type: String,
    },

    approvalStatus: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "N/A",
      ],
      default: "N/A",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;