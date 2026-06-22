const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // ==========================
    // 1. LEAD OWNERSHIP & DETAILS
    // ==========================
      organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    leadOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    leadSource: {
      type: String,
      enum: [
        "Website",
      
        "Referral",
        "Cold Call",
      
        "Trade Show",
      
        "Other",
      ],
    },

    customLeadSource: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      enum: [
        "IT",
        
        "Healthcare",
        "Education",
        "Finance",
        "Manufacturing",
        "Retail",
        "Real Estate",
        "Telecom",
        "Construction",
        "Other",
      ],
    },

    customIndustry: {
      type: String,
      trim: true,
    },

    leadStatus: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Proposal Sent",
        "Negotiation",
        "Won",
        "Lost",
      ],
      
      default: "New",
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      required: true,
    },

    // ==========================
    // 2. CONTACT INFORMATION
    // ==========================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    countryCode: {
      type: String,
      enum: [
        "+91", // India
        "+1", // USA/Canada
        "+44", // UK
        "+61", // Australia
        "+971", // UAE
        "+65", // Singapore
        "+49", // Germany
        "+33", // France
        "+81", // Japan
        "+86", // China
        "Other",
      ],
      default: "+91",
    },

    customCountryCode: {
      type: String,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================
    // 3. COMPANY & ADDRESS
    // ==========================

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      enum: [
        "India",
        "USA/Canada",
        "UK",
        "Australia",
        "Canada",
        "Singapore",
        "Germany",
        "France",
        "UAE",

        "Other",
      ],
      default: "India",
    },

    customCountry: {
      type: String,
      trim: true,
    },

    // ==========================
    // 4. ADDITIONAL NOTES
    // ==========================

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Lead", leadSchema);
