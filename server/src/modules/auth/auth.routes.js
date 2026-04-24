const express = require("express");
const {
  signin,
  signup,
  signout,
  verify_user_email,
  verify_otp,
  reset_forgotten_password,
} = require("./auth.controller");
const { isAuthorize } = require("../../middlewares/auth.middleware");

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/signout", signout);
router.post("/verifyemail", verify_user_email);
router.post("/verifyotp", isAuthorize, verify_otp);
router.post("/resetforgotpassword", reset_forgotten_password);

module.exports = router;
