const nodemailer = require("nodemailer");

const hackMail = async (to, leaderName, teamSize, track) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Startup MP Hackathon" <${process.env.EMAIL_USER}>`,
      to,
      bcc: "imcktiwari@gmail.com",
      subject: "Hackathon Registration Successful 🚀",
      html: `
        <h2>Hello ${leaderName},</h2>

        <p>🎉 Your team has been <b>successfully registered</b> for <b>Startup MP: Hack & Make 2026</b>.</p>

        <h3>📌 Team Details</h3>
        <ul>
          <li><b>Team Size:</b> ${teamSize}</li>
          <li><b>Track:</b> ${track}</li>
        </ul>

        <p>📩 Further instructions will be shared via this email.</p>

        <br/>
        <p>Best Regards,<br/>
        <b>Startup MP Organizing Team</b></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

module.exports = hackMail;
