export const entitySchemas: any = {
  
    contact: [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },

    { key: "phone.countryCode", label: "Country Code" },
    { key: "phone.number", label: "Phone Number" },

    { key: "company", label: "Company" },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },

    { key: "leadSource", label: "Lead Source" },
    { key: "status", label: "Status" },
    { key: "gender", label: "Gender" },

    { key: "altEmail", label: "Alternate Email" },
    { key: "altPhoneNumber", label: "Alternate Phone" },

    { key: "assignedRep.name", label: "Assigned Rep" },
  
    { key: "address.addressLine1", label: "Address Line 1" },
    { key: "address.addressLine2", label: "Address Line 2" },
    { key: "address.city", label: "City" },
    { key: "address.state", label: "State" },
    { key: "address.postalCode", label: "Postal Code" },

    { key: "dob", label: "Date of Birth" },

  ],

  account: [
    { key: "accountName", label: "Account Name" },
  { key: "industry", label: "Industry" },
  { key: "accountType", label: "Account Type" },
  { key: "annualRevenue", label: "Annual Revenue" },

  { key: "website", label: "Website" },
  { key: "gstNumber", label: "GST Number" },
  { key: "panNumber", label: "PAN Number" },
  { key: "paymentTerms", label: "Payment Terms" },

  { key: "description", label: "Description" },

  // Account Owner
  { key: "accountOwner.name", label: "Account Owner" },
  { key: "accountOwner.email", label: "Owner Email" },

  // Primary Contact
  { key: "primaryContact.firstName", label: "Contact First Name" },
  { key: "primaryContact.lastName", label: "Contact Last Name" },
  { key: "primaryContact.email", label: "Contact Email" },
  { key: "primaryContact.designation", label: "Designation" },
  { key: "primaryContact.phone.countryCode", label: "Country Code" },
  { key: "primaryContact.phone.number", label: "Phone Number" },

  // Billing Address
  { key: "billingAddress.addressLine1", label: "Billing Address 1" },
  { key: "billingAddress.addressLine2", label: "Billing Address 2" },
  { key: "billingAddress.city", label: "Billing City" },
  { key: "billingAddress.state", label: "Billing State" },
  { key: "billingAddress.postalCode", label: "Billing Postal Code" },
  { key: "billingAddress.country", label: "Billing Country" },

  // Shipping Address
  { key: "shippingAddress.addressLine1", label: "Shipping Address 1" },
  { key: "shippingAddress.addressLine2", label: "Shipping Address 2" },
  { key: "shippingAddress.city", label: "Shipping City" },
  { key: "shippingAddress.state", label: "Shipping State" },
  { key: "shippingAddress.postalCode", label: "Shipping Postal Code" },
  { key: "shippingAddress.country", label: "Shipping Country" },

  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
  ],


};