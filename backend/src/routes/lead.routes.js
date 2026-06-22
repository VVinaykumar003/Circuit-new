const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");
const { createLead,getAllLeads,updateLead,deleteLead,convertLeadToCustomer } = require("../controllers/lead.controller");

router.post("/:slug/create-leads",auth,tenant, createLead);
router.post("/:slug/convertLeadToCustomer/:leadId", auth, tenant, convertLeadToCustomer);
router.get("/:slug/getAllLeads", auth, tenant, getAllLeads);
router.put("/:slug/updateLead/:leadId", auth, tenant, updateLead);
router.delete("/:slug/deleteLead/:leadId", auth, tenant, deleteLead);
module.exports = router;