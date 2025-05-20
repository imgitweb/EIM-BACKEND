const express = require("express");
const router = express.Router();
const startupController = require("../controller/signup/startupController");
const otpController = require("../controller/signup/otpController");
const paymentController = require("../controller/signup/paymentController");
const subscriptionController = require("../controller/signup/subscriptionController");
const { upload } = require("../middleware/multer");
const { csrfProtection } = require("../middleware/csrf");

// Routes
router.get("/csrf-token", startupController.getCsrfToken);
router.get("/plans", startupController.getPlans);
router.post(
  "/startups",
  upload.single("logo"),
  csrfProtection,
  startupController.createStartup
);

router.post("/otp/send", otpController.sendOtp);
router.post("/otp/verify", csrfProtection, otpController.verifyOtp);
router.post(
  "/payments/create-intent",
  csrfProtection,
  paymentController.createPaymentIntent
);
router.post(
  "/subscriptions",
  csrfProtection,
  subscriptionController.createSubscription
);
router.get(
  "/subscriptions/:startupId",
  subscriptionController.getSubscriptions
);
router.put(
  "/subscriptions/:id/cancel",
  csrfProtection,
  subscriptionController.cancelSubscription
);

module.exports = router;
