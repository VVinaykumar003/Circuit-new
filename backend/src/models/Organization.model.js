const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
 
    organizationName:{
      type: String,
      required: true,
      trim: true,
    },
    organizationEmail:{
      type: String,
      required: true,
      trim: true,
    },
   ownerName:{
      type: String,
      required: true,
      trim: true,
    },
   
    slug:{
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    ownerEmail:{
      type: String,
      required: true,
    },
   
    registrationNumber:{
      type: String,
      trim: true,
    },
    phoneNumber:{
      type: String,
      trim: true,
    },

 

    address: {
      addressLine:{
        type: String,
        trim: true,
      },
      city:{
        type: String,
        trim: true,
      },
      state:{
        type: String,
        trim: true,
      },
      country:{
        type: String,
        trim: true,
      },
      pincode:{
        type: String,
      },
    },
    subscriptionStatus:{
      type: String,
      enum: ["active", "inactive", "trial", "suspended"],
      default: "trial",
    },
    settings:{
      type: Object,
      default: {},
    },
    isActive:{
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Organization", organizationSchema);
