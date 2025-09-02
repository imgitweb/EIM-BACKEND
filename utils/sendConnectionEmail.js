require("dotenv").config(); // Load environment variables
const nodemailer = require("nodemailer");

// Generic Email Sender Function
const sendConnectionEmail = async (recipientEmail, recipientType, userName, partnerName) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Can be replaced with other SMTP services
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  let subject, textBody, htmlBody;

  if (recipientType === "user") {
    // Email to User
    subject = `You are successfully connected with ${partnerName}`;
    textBody = `Hello ${userName},\n\n` +
      `We are excited to inform you that you have been connected with our partner "${partnerName}" for our Startup Guide.\n\n` +
      `They will be reaching out to you soon to support you in your journey.\n\n` +
      `Best regards,\nTeam Shakti Sangam 2025`;

    htmlBody = `<p>Hello <b>${userName}</b>,</p>
                <p>We are excited to inform you that you have been connected with our partner <b>${partnerName}</b> for our <i>Startup Guide</i>.</p>
                <p>They will be reaching out to you soon to support you in your journey.</p>
                <p>Best regards,<br/>Team Shakti Sangam 2025</p>`;
  } else if (recipientType === "partner") {
    // Email to Partner
    subject = `A new user ${userName} has been connected with you`;
    textBody = `Hello ${partnerName},\n\n` +
      `We are pleased to inform you that a new user "${userName}" has been connected with you for our Startup Guide initiative.\n\n` +
      `Please connect with them soon to provide guidance and support.\n\n` +
      `Best regards,\nTeam Shakti Sangam 2025`;

    htmlBody = `<p>Hello <b>${partnerName}</b>,</p>
                <p>We are pleased to inform you that a new user <b>${userName}</b> has been connected with you for our <i>Startup Guide</i> initiative.</p>
                <p>Please connect with them soon to provide guidance and support.</p>
                <p>Best regards,<br/>Team Shakti Sangam 2025</p>`;
  }

  const mailOptions = {
    from: `"Team Shakti Sangam, 2025" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject,
    text: textBody,
    html: htmlBody,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email: " + error.message);
    throw error;
  }
};

module.exports = sendConnectionEmail;


// Example usage:
// // Send email to user
// sendConnectionEmail("user@email.com", "user", "Rahul", "Startup Mentor Pvt Ltd");

// Send email to partner
// sendConnectionEmail("partner@email.com", "partner", "Rahul", "Startup Mentor Pvt Ltd");