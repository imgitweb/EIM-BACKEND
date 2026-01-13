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
    const message = `<div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;background:#f8f9fa;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
                <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center;color:white">
                  <div style="font-size:24px;margin-bottom:8px">🛡️</div>
                  <h1 style="margin:0;font-size:24px">EIM Platform</h1>
                </div>
                
                <div style="padding:30px">
                  <p style="margin:0 0 16px;font-size:18px;color:#333">Hello,</p>
                  <p style="margin:0 0 24px;color:#666">Your OTP for EIM Platform verification is:</p>
                  
                  <div style="background:#f1f3f4;border:2px dashed #ddd;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
                    <h2 style="margin:0;font-size:36px;color:#333;letter-spacing:4px;font-family:monospace">${otp}</h2>
                  </div>
                  
                  <div style="background:#ffeaa7;border-left:4px solid #fdcb6e;padding:12px;border-radius:4px;margin:16px 0">
                    <p style="margin:0;font-size:14px;color:#d63031">⏰ This OTP will expire in 5 minutes.</p>
                  </div>
                  
                  <p style="margin:24px 0 0;color:#666">Thank you,<br><strong>EIM Platform Team</strong></p>
                </div>
              </div>
            `;

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
