const { validationResult } = require("express-validator");
const StartupModel = require("../../models/signup/SubscriptionModel");
const sendEmail = require("../../utils/sendEmails");

exports.sendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    const existingStartup = await StartupModel.findOne({ email });
    if (existingStartup) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (!req.session) {
      return res.status(500).json({ error: "Session not initialized" });
    }
    req.session.otp = {
      code: otp,
      email,
      expires: Date.now() + 5 * 60 * 1000,
    };
    console.log("$OPT", otp);
    const message = `<div style="font-family: Helvetica, Arial, sans-serif; background-color: #eceff1; padding: 40px 0;">
  <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    
    <div style="background-color: #1e293b; padding: 30px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px; font-weight: 600;">EIM PLATFORM</h2>
    </div>

    <div style="padding: 40px 30px;">
      <p style="color: #334155; font-size: 16px; margin: 0 0 20px; text-align: center;">Here is your One-Time Password (OTP)</p>
      
      <div style="background-color: #f1f5f9; padding: 25px; border-radius: 6px; text-align: center; margin: 0 auto 25px;">
        <h1 style="margin: 0; font-size: 42px; color: #0f172a; letter-spacing: 10px; font-weight: bold;">${otp}</h1>
      </div>

      <p style="text-align: center; color: #64748b; font-size: 14px; margin-bottom: 0;">
        ⚠️ This code is valid for <strong>5 minutes</strong> only.<br>
        Do not share this code with anyone.
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">© 2026 EIM Platform. All rights reserved.</p>
    </div>
  </div>
</div>`;

    const emailSent = await sendEmail({
      email,
      subject: "Your OTP Code for EIM Platform",
      message,
    });

    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send email" });
    }

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
  try {
    const { email, otp } = req.body;

    if (!req.session || !req.session.otp) {
      return res.status(400).json({
        error: "Session expired. Please request a new OTP.",
      });
    }

    const { code, expires, email: storedEmail } = req.session.otp;

    if (Date.now() > expires) {
      delete req.session.otp;
      return res.status(400).json({
        error: "OTP expired. Please request a new OTP.",
      });
    }

    if (storedEmail !== email) {
      return res.status(400).json({
        error: "Email mismatch. Please request a new OTP.",
      });
    }

    if (code !== otp) {
      return res.status(400).json({
        error: "Invalid OTP.",
      });
    }

    delete req.session.otp;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          error: "Session error. Please try again.",
        });
      }

      return res.status(200).json({
        message: "OTP verified successfully",
      });
    });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return res.status(500).json({
      error: "Failed to verify OTP. Please try again.",
    });
  }
};
