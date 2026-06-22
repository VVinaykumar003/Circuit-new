const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");
const { createContact, getAllContacts, updateContact, deleteContact } = require("../controllers/contact.controller");

router.post("/:slug/create", auth, tenant, createContact);

router.get("/:slug/get",auth, tenant, getAllContacts);



router.put("/:slug/update/:id", auth, tenant, updateContact);

router.delete("/:slug/delete/:id", auth, tenant, deleteContact);
module.exports = router;