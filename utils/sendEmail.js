require("dotenv").config(); // Load environment variables

const nodemailer = require("nodemailer");

const sendEmail = async (recipientEmail, userName) => {
  // Create a transporter object using Gmail SMTP or any other email provider
  const transporter = nodemailer.createTransport({
    service: "gmail", // Can be replaced with other SMTP services
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  // Setup email data
  const mailOptions = {
    from: `"Team Shakti Sangam, 2025" <${process.env.EMAIL_USER}>`,
    to: recipientEmail, // Receiver's email address
    subject:
      "Thanks for the registration, we will confirm your participation soon.",
    text:
      `Hello ${userName},\n\n` +
      `Thanks for your participation. This is only a confirmation of your registration.\n` +
      `We will get back to you with the confirmation email shortly if you are shortlisted to attend the event.\n\n` +
      `Meanwhile, please follow the social media handles of Shakti Sangam 2025:\n` +
      `- Facebook: http://facebook.com/clubsherise\n` +
      `- LinkedIn: https://www.linkedin.com/company/shaktisangam\n` +
      `- Twitter: https://x.com/ClubSheRise\n` +
      `- Instagram: https://www.instagram.com/club.sherise/\n\n` +
      `Thank you,\n` +
      `Team Shakti Sangam 2025`,
    html: `<p>Hello ${userName},</p>
           <p>Thanks for your participation. This is only a confirmation of your registration.</p>
           <p>We will get back to you with the confirmation email shortly if you are shortlisted to attend the event.</p>
           <p>Meanwhile, please follow the social media handles of Shakti Sangam 2025:</p>
           <ul>
             <li><a href="http://facebook.com/clubsherise">Facebook</a></li>
             <li><a href="https://www.linkedin.com/company/shaktisangam">LinkedIn</a></li>
             <li><a href="https://x.com/ClubSheRise">Twitter</a></li>
             <li><a href="https://www.instagram.com/club.sherise/">Instagram</a></li>
           </ul>
           <p>Thank you,<br/>Team Shakti Sangam 2025</p>`,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email: " + error.message);
    throw error;
  }
};

module.exports = sendEmail;
