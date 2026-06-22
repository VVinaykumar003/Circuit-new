const mongoose = require("mongoose");

const COUNTRY_CODES = [
  "+91",
  "+1",
  "+44",
  "+61",
  "+971",
  "+65",
  "+49",
  "+33",
];

const contactSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    assignedRep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dob: Date,

    // Contact Information
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    altEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      countryCode: {
        type: String,
        enum: COUNTRY_CODES,
        default: "+91",
      },

      number: {
        type: String,
        required: true,
      },
    },

    altPhoneNumber: String,

    // Professional Information
    company: {
      type: String,
      trim: true,
      
    },

    department: String,

    designation: String,

    leadSource: {
      type: String,
      enum: [
        "Website",
        "Referral",
        "Cold Call",
        "Social Media",
        "Email Campaign",
        "Event",
        "Other",
      ],
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Prospect",
        "Customer",
        "VIP",
        "Blocked",
      ],
      default: "Active",
    },

    // Address Information
    address: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,

      country: {
        type: String,
        enum: [
          "India",
          "United States",
          "United Kingdom",
          "Australia",
          "Canada",
          "Germany",
          "France",
          "Singapore",
          "UAE",
          "Other",
        ],
      },

      countryOther: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactSchema);