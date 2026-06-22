const LeadModel = require("../models/Lead.model");
const Lead = require("../models/Lead.model.js")
const Account = require("../models/Account.model.js")
const Contact = require("../models/Contact.model.js")
const logger = require("../common/libs/logger");


const createLead = async (req, res) => {
  const organizationId = req.organization._id;
  try {
    const {
      organization = organizationId,
      leadOwner,
      leadSource,
      customLeadSource,
      industry,
      customIndustry,
      leadStatus,
      priority,
      firstName,
      lastName,
      email,
      gender,
      countryCode,
      customCountryCode,
      phoneNumber,
      companyName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      customCountry,
      description,
    } = req.body;

    // Check required fields
    if (
      !leadOwner ||
      !firstName ||
      !email ||
      !phoneNumber ||
      !companyName
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Duplicate email check
   const existingLead = await LeadModel.findOne({
  organizationId,
  email,
});

    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: "Lead already exists with this email",
      });
    }

    const lead = await LeadModel.create({
        organization,
      leadOwner,
      leadSource,
      customLeadSource,
      industry,
      customIndustry,
      leadStatus,
      priority,
      firstName,
      lastName,
      email,
      gender,
      countryCode,
      customCountryCode,
      phoneNumber,
      companyName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      customCountry,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const getAllLeads = async (req, res) => {
  const organizationId = req.organization._id;
  try {
    const leads = await LeadModel.find({ organization: organizationId }).populate("leadOwner", "name email");

    return res.status(200).json({
      success: true,
      message: "Leads retrieved successfully",
      data: leads,
    });
  } catch (error) {
    console.error("Get Leads Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



const updateLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    logger.info(`Updating lead with ID: ${leadId}`);
    const organizationId = req.organization._id;
    logger.info(`Organization ID: ${organizationId}`);


    const lead = await LeadModel.findOne({
      _id: leadId,
      organizationId,
    });



    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Email duplicate check (if email is being updated)
    if (req.body.email) {
      const existingLead = await LeadModel.findOne({
        email: req.body.email,
        organizationId,
        _id: { $ne: leadId },
      });

      if (existingLead) {
        return res.status(409).json({
          success: false,
          message: "Lead already exists with this email",
        });
      }
    }

    const updatedLead = await LeadModel.findByIdAndUpdate(
      leadId,
      {
        ...req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * Converts a Lead into an Account and Contact
 * POST /api/:slug/sales/leads/:leadId/convert
 */
// const convertLeadToCustomer = async (req, res) => {
//   try {
//     const { leadId } = req.params;
//     const tenantId = req.organization?._id || req.tenantId;

//     // 1. Find the lead
//     const lead = await Lead.findOne({ _id: leadId });
//     if (!lead) {
//       return res.status(404).json({ success: false, message: "Lead not found" });
//     }

//     if (lead.leadStatus === "Won") {
//       return res.status(400).json({ success: false, message: "Lead is already converted." });
//     }

//     // 2. Create an Account from the Lead's company info
//     const newAccount = new Account({
//       tenantId: tenantId,
//       organization: tenantId,
//       accountOwner: lead.leadOwner,
//       accountName: lead.companyName || `${lead.firstName} ${lead.lastName}`,
//       accountType: "Business",
//       industry: lead.industry,
//       status: "Customer",
//       primaryContact: {
//         firstName: lead.firstName,
//         lastName: lead.lastName,
//         email: lead.email,
//         phone: {
//           countryCode: lead.countryCode || "+1",
//           number: lead.phoneNumber
//         }
//       }
//     });
//     await newAccount.save();

//     // 3. Create a Contact from the Lead's personal info
//     const newContact = new Contact({
//       tenantId: tenantId,
//       organization: tenantId,
//       firstName: lead.firstName,
//       lastName: lead.lastName,
//       email: lead.email,
//       phone: {
//          countryCode: lead.countryCode || "+1",
//          number: lead.phoneNumber
//       },
//       account: newAccount._id,
//       leadSource: lead.leadSource,
//       assignedRep: lead.leadOwner,
//       status: "Customer"
//     });
//     await newContact.save();

//     // 4. Update the Lead status to "Won" / Converted
//     lead.leadStatus = "Won";
//     await lead.save();

//     return res.status(200).json({
//       success: true,
//       message: "Lead successfully converted to Customer",
//       data: {
//         account: newAccount,
//         contact: newContact,
//         lead
//       }
//     });

//   } catch (error) {
//     console.error("Error converting lead:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to convert lead to customer"
//     });
//   }
// };

const convertLeadToCustomer = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Adapt to your authentication / tenant context
    const tenantId = req.organization?._id || req.tenantId || req.user?.organization;

    // 1. Find the lead
    const lead = await Lead.findOne({ _id: leadId });
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    if (lead.leadStatus === "Won") {
      return res.status(400).json({ success: false, message: "Lead is already converted." });
    }

    // ----------------------------------------------------
    // SAFE ENUM MAPPINGS (Prevent Validation Errors)
    // ----------------------------------------------------
    
    // Map industry (IT -> Technology)
    const validIndustries = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Other"];
    let mappedIndustry = "Other";
    if (lead.industry) {
      if (validIndustries.includes(lead.industry)) {
        mappedIndustry = lead.industry;
      } else if (lead.industry.toUpperCase() === "IT") {
        mappedIndustry = "Technology";
      }
    }

    // Validate Country Code Enum
    const validCountryCodes = ["+91", "+1", "+44", "+61", "+971", "+65", "+49", "+33"];
    const mappedCountryCode = validCountryCodes.includes(lead.countryCode) ? lead.countryCode : "+91";

    // Map Lead Source Enum
    const validSources = ["Website", "Referral", "Cold Call", "Social Media", "Email Campaign", "Event", "Other"];
    const mappedSource = validSources.includes(lead.source || lead.leadSource) ? (lead.source || lead.leadSource) : "Other";

    // 2. Create an Account from the Lead's company info
    const newAccount = new Account({
      organization: tenantId,
      accountOwner: lead.leadOwner,
      accountName: lead.companyName || `${lead.firstName} ${lead.lastName}`,
      accountType: "Business",
      industry: mappedIndustry,
      primaryContact: {
        firstName: lead.firstName || "Unknown",
        lastName: lead.lastName || "Unknown",
        email: lead.email || "no-email@example.com",
        phone: {
          countryCode: mappedCountryCode,
          number: lead.phoneNumber || "0000000000"
        }
      },
      // Safely default required billing fields to pass validation
      billingAddress: {
        addressLine1: lead.address || "Not Provided",
        city: lead.city || "Unknown",
        state: lead.state || "Unknown",
        postalCode: lead.postalCode || "000000",
        country: "Other" // Safe fallback from your Enum
      }
    });
    
    await newAccount.save();

    // 3. Create a Contact from the Lead's personal info
    const newContact = new Contact({
      organization: tenantId,
      assignedRep: lead.leadOwner,
      firstName: lead.firstName || "Unknown",
      lastName: lead.lastName || "Unknown",
      email: lead.email || "no-email@example.com",
      phone: {
         countryCode: mappedCountryCode,
         number: lead.phoneNumber || "0000000000"
      },
      leadSource: mappedSource,
      status: "Customer"
    });
    
    await newContact.save();

    // 4. Update the Lead status to "Won" / Converted
    lead.leadStatus = "Won";
    await lead.save();

    return res.status(200).json({
      success: true,
      message: "Lead successfully converted to Customer",
      data: {
        account: newAccount,
        contact: newContact,
        lead
      }
    });

  } catch (error) {
    console.error("Error converting lead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to convert lead to customer",
      error: error.message
    });
  }
};



const deleteLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const organizationId = req.organization._id;

    const lead = await LeadModel.findOne({
      _id: leadId,
      organizationId,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await LeadModel.findByIdAndDelete(leadId);

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lead Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


module.exports = {
  createLead,
  getAllLeads,
  updateLead,
  deleteLead,
  convertLeadToCustomer
};