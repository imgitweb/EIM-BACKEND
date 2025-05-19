const { validationResult } = require("express-validator");
const StartupModel = require("../../models/signup/SubscriptionModel");

exports.sendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    console.log(email);

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    const startup = await StartupModel.findOne({ email });
    if (!startup) {
      return res.status(404).json({ error: "Email already exits" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!req.session) {
      req.session = {};
    }

    req.session.otp = {
      code: otp,
      email,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
    };

    console.log(`OTP for ${email}: ${otp}`); // Replace with email service in production

    res.status(200).json({ message: "OTP sent successfully" });
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

    if (!req.session || !req.session.otp) {
      return res
        .status(400)
        .json({ error: "No OTP session found. Please request a new OTP." });
    }

    const storedOtp = req.session.otp;

    if (
      storedOtp.email === email &&
      storedOtp.code === otp &&
      storedOtp.expires > Date.now()
    ) {
      req.session.otp = null; // Clear session after verification
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      if (storedOtp.expires <= Date.now()) {
        return res
          .status(400)
          .json({ error: "OTP has expired. Please request a new one." });
      }
      res.status(400).json({ error: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ error: "Failed to verify OTP. Please try again." });
  }
};
