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
        user: process.env.EMAIL_USER || "your-email@incubationmasters.com",
        pass: process.env.EMAIL_PASS || "your-email-password",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || "EIM Platform <your-email@gmail.com>",
      to: options.email,
      bcc: "cktiwari@gmail.com",
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
