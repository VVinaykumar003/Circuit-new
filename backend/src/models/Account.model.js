const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    // 🏢 1. Organization Details
    accountOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountType: {
      type: String,
      enum: [
        "Individual",
        "Partner",
        "Business",
        "Retailer",
        "Distributor",
        "Enterprise",
      ],
      default: "Individual",
    },

    industry: {
      type: String,
      enum: [
        "Technology",
        "Finance",
        "Healthcare",
        "Education",
        "Manufacturing",
        "Retail",
        "Other",
      ],
    },

    website: {
      type: String,
      trim: true,
    },

    annualRevenue: {
      type: Number,
      default: 0,
    },

    // 2. Primary Contact Person
    primaryContact: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      designation: {
        type: String,
        trim: true,
      },
      phone: {
        countryCode: {
          type: String,
          default: "+91",
        },
        number: {
          type: String,
          required: true,
        },
      },
    },

    //  3. Address Information
    billingAddress: {
      addressLine1: {
        type: String,
        required: true,
      },
      addressLine2: String,
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        enum: [
          "United States",
          "Canada",
          "United Kingdom",
          "Australia",
          "India",
          "Germany",
          "France",
          "Singapore",
          "UAE",
          "Other",
        ],
        required: true,
      },
      countryOther: String,
    },

    shippingAddress: {
      sameAsBilling: {
        type: Boolean,
        default: true,
      },
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      countryOther: String,
    },

    // 💰 4. Financial & Additional Info
    gstNumber: {
      type: String,
      trim: true,
    },

    panNumber: {
      type: String,
      trim: true,
    },

    paymentTerms: {
      type: String,
      enum: [
        "Immediate",
        "Net 15",
        "Net 30",
        "Net 45",
        "Net 60",
        "Installments",
      ],
      default: "Net 30",
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  },
);

module.exports = mongoose.model("Account", accountSchema);
