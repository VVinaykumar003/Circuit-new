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
    const finalShippingAddress =
  shippingAddress?.sameAsBilling
    ? {
        sameAsBilling: true,
        addressLine1: billingAddress.addressLine1,
        addressLine2: billingAddress.addressLine2,
        city: billingAddress.city,
        state: billingAddress.state,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country,
        countryOther: billingAddress.countryOther,
      }
    : shippingAddress;

      const formattedPhone = {
      countryCode: primaryContact.phone.countryCode || "+91",
      number: primaryContact.phone.number,
    };

    // 📦 Create account
    const account = await AccountModel.create({
     organization: organizationId, // ⭐ multi-tenant key
      accountOwner,

      accountName,
      accountType,
      industry,
      website,
      annualRevenue,

        primaryContact: {
        ...primaryContact,
        phone: formattedPhone,
      },

      billingAddress,
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