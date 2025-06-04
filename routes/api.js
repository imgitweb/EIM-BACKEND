// routes/signup.js

const express = require("express");
const router = express.Router();
const startupController = require("../controller/signup/startupController");
const otpController = require("../controller/signup/otpController");
const paymentController = require("../controller/signup/paymentController");
const subscriptionController = require("../controller/signup/subscriptionController");
const { upload } = require("../middleware/multer");
const { csrfProtection } = require("../middleware/csrf");
const {
  googleLogin,
  login,
  googleSignup,
} = require("../controller/authController");

// Routes that DON'T need CSRF protection
router.get("/csrf-token", startupController.getCsrfToken);
router.get("/plans", startupController.getPlans);
router.get(
  "/subscriptions/:startupId",
  subscriptionController.getSubscriptions
);

// OTP send doesn't need CSRF (it's the first step)
router.post("/otp/send", otpController.sendOtp);

// Routes that DO need CSRF protection
router.post("/otp/verify", csrfProtection, otpController.verifyOtp);

router.post(
  "/startups",
  csrfProtection,
  upload.single("logo"),
  startupController.createStartup
);

router.post("/auth-check", googleSignup);

router.post(
  "/payments/create-payment-intent",
  csrfProtection,
  paymentController.createPaymentIntent
);

router.post(
  "/subscriptions",
  csrfProtection,
  subscriptionController.createSubscription
);

router.put(
  "/subscriptions/:id/cancel",
  csrfProtection,
  subscriptionController.cancelSubscription
);

module.exports = router;
