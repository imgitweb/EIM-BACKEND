require("dotenv").config();
const nodemailer = require("nodemailer");

const sendEmail = async (recipientEmail, userName) => {
  console.log("--->",recipientEmail, userName)

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Team Incubation Master" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "Thank You for Connecting With Us",
    text:
      `Hello ${userName},\n\n` +
      `Thank you for reaching out to us. We truly appreciate you taking the time to connect.\n\n` +
      `Our team has received your message and will review it shortly. We will get back to you as soon as possible.\n\n` +
      `Meanwhile, feel free to explore and stay connected with us through our social media platforms:\n` +
      `Facebook: http://facebook.com/clubsherise\n` +
      `LinkedIn: https://www.linkedin.com/company/shaktisangam\n` +
      `Twitter: https://x.com/ClubSheRise\n` +
      `Instagram: https://www.instagram.com/club.sherise/\n\n` +
      `Warm regards,\nTeam Shakti Sangam`,

    html: `
    <div style="background:#f4f6f8;padding:30px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

        <div style="background:#6a1b9a;color:#ffffff;padding:20px;text-align:center;">
          <h2 style="margin:0;font-size:22px;">Thank You for Connecting With Us</h2>
        </div>

        <div style="padding:25px;color:#333;font-size:15px;line-height:1.6;">
          <p>Dear <strong>${userName}</strong>,</p>

          <p>
            Thank you for reaching out to us. We truly appreciate your interest and the time you took to connect.
          </p>

          <p>
            Our team has successfully received your message and will review it shortly.
            One of our representatives will get back to you as soon as possible.
          </p>

          <hr style="border:none;border-top:1px solid #e0e0e0;margin:25px 0;" />

          <p style="margin-bottom:10px;"><strong>Stay Connected With Us</strong></p>

          <table cellpadding="6" cellspacing="0" style="font-size:14px;">
            <tr>
              <td>📘 Facebook:</td>
              <td><a href="https://www.facebook.com/IncubationMasters/">facebook.com/IncubationMasters</a></td>
            </tr>
            <tr>
              <td>🔗 LinkedIn:</td>
              <td><a href="https://www.linkedin.com/company/incubationmasters/posts/?feedView=all">linkedin.com/company/IncubationMasters</a></td>
            </tr>
            <tr>
              <td>🐦 Twitter:</td>
              <td><a href="https://x.com/IncubationMS">x.com/IncubationMasters</a></td>
            </tr>
            <tr>
              <td>📸 Instagram:</td>
              <td><a href="https://www.instagram.com/incubationmasters/?hl=en">instagram.com/IncubationMasters</a></td>
            </tr>
          </table>

          <p style="margin-top:25px;">
            Warm regards,<br />
            <strong>Team Incubation Masters</strong>
          </p>
        </div>

        <div style="background:#f0f0f0;text-align:center;padding:12px;font-size:12px;color:#777;">
          © 2025 Incubation Masters. All rights reserved.
        </div>

      </div>
    </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
