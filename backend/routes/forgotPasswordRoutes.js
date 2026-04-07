const express = require("express");
const router = express.Router();

const {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
} = require("../controller/forgotPasswordController");

router.post("/forgot-password", sendForgotPasswordOtp);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
router.post("/reset-password", resetPassword);

module.exports = router;