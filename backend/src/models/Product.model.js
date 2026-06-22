const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    // Basic Info
    productGroup: {
      type: String,
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

    // Inventory
    stockTracking: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    uom: { type: String }, // Unit of Measure
    warehouse: { type: String },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out Of Stock"],
      default: "In Stock",
    },

    // Categorization
    brand: { type: String },
    category: { type: String },
    subCategory: { type: String },
    tags: [{ type: String }],

    // Sales Config
    availableForSale: { type: Boolean, default: true },
    allowDiscount: { type: Boolean, default: true },
    minQty: { type: Number, default: 0, min: 0 },
    maxQty: { type: Number },
    commission: { type: Number, default: 0, min: 0, max: 100 },

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
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
