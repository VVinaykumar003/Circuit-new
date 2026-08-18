const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    // Basic Info
    productType: {
      type: String,
      enum: ["ERP", "CRM", "SaaS", "POS", "HRMS", "Other"],
      required: [true, "Product Group is required"],
      trim: true,
    },
    productName: {
      type: String,
      required: [true, "Product Name is required"],
      trim: true,
      maxlength: 200,
    },
    productCode: {
      type: String,
      required: [true, "Product Code is required"],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Discontinued"],
      default: "Active",
    },
    description: {
      type: String,
    },
    version: {
      type: String,
      trim: true,
    },
    releaseChannel: {
      type: String,
      enum: ["Stable", "Beta", "Alpha"],
      default: "Stable",
    },

    // Licensing
    licenseType: {
      type: String,
      enum: ["One Time", "Monthly", "Yearly", "Lifetime"],
    },
    activationType: {
      type: String,
      enum: ["License Key", "Email", "Domain", "Device", "API Key"],
    },
    validityDays: {
      type: Number,
      min: 0,
    },
    maxUsers: { type: Number, min: 0 },
    maxDevices: { type: Number, min: 0 },


    // Pricing
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 18,
      min: 0,
      max: 100,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Platform Support
    platformSupport: [{
      type: String,
      enum: ["windows", "macos", "linux", "android", "ios", "web"],
    }],

    // Downloads
    softwareDownloadUrl: { type: String },
    documentationUrl: { type: String },
    demoUrl: { type: String },
    releaseNotesUrl: { type: String },

    // Media
    logoUrl: { type: String },
    bannerUrl: { type: String },
    screenshotUrls: [{ type: String }],
    videoUrl: { type: String },

    // Features
    features: [{
      name: { type: String, required: true },
    }],

    // Plans
    plans: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      billingCycle: {
        type: String,
        enum: ["Monthly", "Yearly", "One Time"],
        default: "Monthly",
      },
      features: [{ type: String }], // List of feature names included in this plan
    }],

    // Categorization (renamed from category)
    softwareCategory: { type: String },
    tags: [{ type: String }],

    showOnWebsite: { type: Boolean, default: true },
    allowTrial: { type: Boolean, default: false },
    allowDemo: { type: Boolean, default: false },
    publishStatus: {
      type: String,
      enum: ["Published", "Draft", "Archived"],
      default: "Draft",
    },

    // SEO
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: { type: String },

    // Media & Documents
    images: [{ type: String }], // Array of image URLs
    documents: [{ 
      name: String, 
      url: String 
    }],
    // Removed fields:
    // barcode
    // stockTracking
    // stockQuantity
    // reorderLevel
    // uom
    // warehouse
    // stockStatus
    // brand
    // allowDiscount
    // minQty
    // maxQty
    // commission
    // documents (replaced by specific URL fields)
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
