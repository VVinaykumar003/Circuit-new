const AccountModel = require("../models/Account.model");



const createAccount = async (req, res) => {
  try {
   const organizationId = req.organization._id;
  
 console.log("Create Account Request:", { organizationId, body: req.body });
    const {
      accountName,
      accountOwner,
      accountType,
      industry,
      website,
      annualRevenue,
      primaryContact,
      billingAddress,
      shippingAddress,
      gstNumber,
      panNumber,
      paymentTerms,
      description,
    
    } = req.body;

    const mongoose = require("mongoose");
    const resolvedOwner = (accountOwner && mongoose.Types.ObjectId.isValid(accountOwner)) ? accountOwner : (req.user?._id || req.user?.userId);

    // Normalize accountType
    const validAccountTypes = ["Individual", "Partner", "Business", "Retailer", "Distributor", "Enterprise"];
    let resolvedAccountType = "Business";
    if (validAccountTypes.includes(accountType)) resolvedAccountType = accountType;
    else if (String(accountType).toLowerCase().includes("individual")) resolvedAccountType = "Individual";
    else if (String(accountType).toLowerCase().includes("partner")) resolvedAccountType = "Partner";
    else if (String(accountType).toLowerCase().includes("retail")) resolvedAccountType = "Retailer";
    else if (String(accountType).toLowerCase().includes("distribut")) resolvedAccountType = "Distributor";
    else if (String(accountType).toLowerCase().includes("enterprise")) resolvedAccountType = "Enterprise";

    // Normalize industry
    const validIndustries = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Other"];
    let resolvedIndustry = "Technology";
    if (validIndustries.includes(industry)) resolvedIndustry = industry;
    else if (String(industry).toLowerCase().includes("tech") || String(industry).toLowerCase().includes("it") || String(industry).toLowerCase().includes("software")) resolvedIndustry = "Technology";
    else if (String(industry).toLowerCase().includes("fin")) resolvedIndustry = "Finance";
    else if (String(industry).toLowerCase().includes("health") || String(industry).toLowerCase().includes("med")) resolvedIndustry = "Healthcare";
    else if (String(industry).toLowerCase().includes("edu")) resolvedIndustry = "Education";
    else if (String(industry).toLowerCase().includes("manuf")) resolvedIndustry = "Manufacturing";
    else if (String(industry).toLowerCase().includes("retail")) resolvedIndustry = "Retail";
    else resolvedIndustry = "Other";

    // Normalize primaryContact
    const contactObj = primaryContact || {};
    let contactFirstName = contactObj.firstName;
    let contactLastName = contactObj.lastName;
    if (!contactFirstName && contactObj.name) {
      const parts = contactObj.name.trim().split(" ");
      contactFirstName = parts[0] || "Primary";
      contactLastName = parts.slice(1).join(" ") || "Contact";
    }
    contactFirstName = contactFirstName || "Primary";
    contactLastName = contactLastName || "Contact";
    const contactEmail = contactObj.email || req.body.accountEmail || req.user?.email || "contact@account.com";
    const rawPhoneNum = (typeof contactObj.phone === 'object' && contactObj.phone?.number) ? contactObj.phone.number : (contactObj.phone || req.body.phone || "9999999999");
    const rawCountryCode = (typeof contactObj.phone === 'object' && contactObj.phone?.countryCode) ? contactObj.phone.countryCode : "+91";

    const formattedPhone = {
      countryCode: rawCountryCode,
      number: rawPhoneNum,
    };

    // Normalize billingAddress
    const bObj = typeof billingAddress === 'object' && billingAddress !== null ? billingAddress : { addressLine1: String(billingAddress || "Main Office") };
    const billingAddressFull = {
      addressLine1: bObj.addressLine1 || "Main Office",
      addressLine2: bObj.addressLine2 || "",
      city: bObj.city || "Bengaluru",
      state: bObj.state || "Karnataka",
      postalCode: bObj.postalCode || "560001",
      country: bObj.country || "India",
    };

    const finalShippingAddress =
      shippingAddress?.sameAsBilling
        ? {
            sameAsBilling: true,
            addressLine1: billingAddressFull.addressLine1,
            addressLine2: billingAddressFull.addressLine2,
            city: billingAddressFull.city,
            state: billingAddressFull.state,
            postalCode: billingAddressFull.postalCode,
            country: billingAddressFull.country,
            countryOther: billingAddressFull.countryOther,
          }
        : (typeof shippingAddress === 'object' && shippingAddress !== null ? shippingAddress : {});

    // 📦 Create account
    const account = await AccountModel.create({
      organization: organizationId,
      accountOwner: resolvedOwner,

      accountName,
      accountType: resolvedAccountType,
      industry: resolvedIndustry,
      website,
      annualRevenue,

      primaryContact: {
        firstName: contactFirstName,
        lastName: contactLastName,
        email: contactEmail,
        designation: contactObj.designation || "Manager",
        phone: formattedPhone,
      },

      billingAddress: billingAddressFull,
      shippingAddress: finalShippingAddress,

      gstNumber,
      panNumber,
      paymentTerms,
      description,
    });

    return res.status(201).json({
      message: "Account created successfully",
      data: account,
    });
  } catch (error) {
    console.error("Create Account Error:", error);
    return res.status(500).json({
      message: "Server error while creating account",
      error: error.message,
    });
  }
};

const getAllAccounts = async (req, res) => {
  const organizationId = req.organization._id;
  try {
    const accounts = await AccountModel.find({ organization: organizationId }).populate("accountOwner", "name email");
    return res.status(200).json({
      message: "Accounts retrieved successfully",
      data: accounts,
    });
  } catch (error) {
    console.error("Get All Accounts Error:", error);
    return res.status(500).json({
      message: "Server error while retrieving accounts",
      error: error.message,
    });
  }
};

const updateAccount = async (req, res) => {
  try {
   const organizationId = req.organization._id;
    const accountId = req.params.accountId;
    console.log("Update Account Request:", { organizationId, accountId, body: req.body });
    let account = await AccountModel.findOne({
      _id: accountId,
      organizationId,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    if (req.body.primaryContact?.phone) {
      req.body.primaryContact.phone = {
        countryCode:
          req.body.primaryContact.phone.countryCode || "+91",
        number: req.body.primaryContact.phone.number,
      };
    }

    // 📦 Update account
    account = await AccountModel.findByIdAndUpdate(
      accountId,
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Account updated successfully",
      data: account,
    });
  } catch (error) {
    console.error("Update Account Error:", error);
    return res.status(500).json({
      message: "Server error while updating account",
    });
  }
};


const deleteAccount = async (req, res) => {
  try {
    const organizationId = req.organization._id;
    const accountId = req.params.accountId;

    // 🔍 Find account with multi-tenant check
    const account = await AccountModel.findOne({
      _id: accountId,
      organizationId,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }


    await AccountModel.deleteOne({
      _id: accountId,
      organizationId,
    });

    return res.status(200).json({
      message: "Account  deleted successfully",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({
      message: "Server error while deleting account",
    });
  }
};



module.exports = { createAccount, updateAccount,deleteAccount, getAllAccounts };