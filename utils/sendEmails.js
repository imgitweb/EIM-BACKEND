// server/utils/sendEmail.js - Email Utility
const nodemailer = require("nodemailer");

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email body (HTML)
 * @returns {Promise<boolean>} - Success status
 */
const sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER || "your-email@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "your-email-password",
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || "EIM Platform <your-email@gmail.com>",
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

module.exports = sendEmail;
