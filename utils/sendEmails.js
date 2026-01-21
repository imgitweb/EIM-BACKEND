// server/utils/sendEmail.js

const nodemailer = require("nodemailer");

/**
 * Send email using nodemailer
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - HTML message body
 * @returns {Promise<object>} - Nodemailer response info on success, throws on error
 */
const sendEmail = async (options) => {
  // Validate required options
  if (!options?.email || !options?.subject || !options?.message) {
    throw new Error("Email options missing: email, subject, and message are required");
  }

  // Validate SMTP credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("SMTP credentials missing in .env: EMAIL_USER and EMAIL_PASS required");
    throw new Error("Email configuration error");
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail", // Gmail, Outlook, etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Remove insecure TLS override — Gmail handles it correctly
  });

  // Define mail options
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Incubation Masters" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info; // Return full info for debugging if needed
  } catch (error) {
    console.error("Failed to send email:", {
      to: options.email,
      subject: options.subject,
      error: error.message,
      code: error.code,
      response: error.response,
    });
    throw error; // Re-throw so controller can handle it properly
  }
};

module.exports = sendEmail;