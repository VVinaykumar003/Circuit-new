const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const { registerCompany, login,logout,getMe } =
require("../controllers/auth.controller");
// const auth = require("../middlewares/auth.middleware")

router.post("/register-company", registerCompany);

router.post("/login", login);

router.post("/logout", logout);
router.get("/me", getMe);



module.exports = router;