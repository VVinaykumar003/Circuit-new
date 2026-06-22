const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const tenant = require("../middlewares/tenant.middleware");
const { createAccount,updateAccount,deleteAccount,getAllAccounts } = require("../controllers/account.controller");

router.post("/:slug/create", auth, tenant, createAccount);
router.get("/:slug/get", auth, tenant, getAllAccounts);
router.put("/:slug/update/:accountId", auth, tenant, updateAccount);
router.delete("/:slug/delete/:accountId", auth, tenant, deleteAccount);
module.exports = router;