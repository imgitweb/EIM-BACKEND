// controller/signup/otpController.js

const { validationResult } = require("express-validator");
const StartupModel = require("../../models/signup/SubscriptionModel");

exports.sendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    console.log("Sending OTP to:", email);

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Check if email already exists
    const existingStartup = await StartupModel.findOne({ email });
    if (existingStartup) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Ensure session exists
    if (!req.session) {
      return res.status(500).json({ error: "Session not initialized" });
    }

    // Store OTP in session
    req.session.otp = {
      code: otp,
      email,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    };

    console.log(`OTP for ${email}: ${otp}`);
    console.log("Session OTP stored:", req.session.otp);

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }

      console.log("OTP session saved successfully");
      res.status(200).json({ message: "OTP sent successfully" });
    });
  } catch (error) {
    console.error("OTP Send Error:", error);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

exports.verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, otp } = req.body;

    console.log("Verifying OTP for:", email);
    console.log("Received OTP:", otp);
    console.log("Session exists:", !!req.session);
    console.log("Session OTP:", req.session?.otp);

    // Check if session and OTP exist
    if (!req.session) {
      return res.status(400).json({
        error: "Session not found. Please request a new OTP.",
      });
    }

    if (!req.session.otp) {
      return res.status(400).json({
        error: "No OTP session found. Please request a new OTP.",
      });
    }

    const storedOtp = req.session.otp;

    // Check if OTP has expired
    if (storedOtp.expires <= Date.now()) {
      req.session.otp = null;
      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    // Verify email and OTP
    if (storedOtp.email !== email) {
      return res.status(400).json({
        error: "Email mismatch. Please request a new OTP.",
      });
    }

    if (storedOtp.code !== otp) {
      return res.status(400).json({
        error: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid - clear it from session
    req.session.otp = null;

    // Save session after clearing OTP
    req.session.save((err) => {
      if (err) {
        console.error("Session save error after OTP verification:", err);
      }
    });

    console.log("OTP verified successfully for:", email);
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ error: "Failed to verify OTP. Please try again." });
  }
};
