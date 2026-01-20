require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// ==================================================================
// 1. CONFIGURATION
// ==================================================================
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/your_database_name';
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-app-password';
const SITE_URL = 'https://www.incubationmasters.com/login';

// ==================================================================
// 2. DATABASE MODEL (Adjust to match your User Schema)
// ==================================================================
// We assume you have a 'User' collection with 'name', 'email', and 'lastLogin'
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  lastLogin: Date,
});

// Prevent overwriting model if already compiled
const User = mongoose.models.User || mongoose.model('User', userSchema);

// ==================================================================
// 3. EMAIL TRANSPORTER SETUP
// ==================================================================
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or 'SMTP', 'Outlook', etc.
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// ==================================================================
// 4. HTML TEMPLATE GENERATOR
// ==================================================================
const getEmailHtml = (userName) => {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We missed you at EIM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">

  <div style="background-color: #f8f9fa; padding: 40px 20px;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #eeeeee; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
      
      <div style="padding: 40px;">

        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #212529; font-size: 24px; font-weight: 700; margin: 0;">
            Hi ${userName}, I missed you at EIM 👀
          </h2>
        </div>

        <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          It’s been a week since your last login.<br>
          Your startup journey is waiting — and so are:
        </p>

        <div style="background-color: #fff; margin-bottom: 30px; padding-left: 10px;">
          <ul style="color: #495057; font-size: 16px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 5px;">New insights</li>
            <li style="margin-bottom: 5px;">Mentor opportunities</li>
            <li style="margin-bottom: 0;">Growth tasks</li>
          </ul>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${SITE_URL}" style="background-color: #0d6efd; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
            🔁 Jump Back In
          </a>
        </div>

        <p style="color: #6c757d; font-size: 15px; text-align: center; margin: 0;">
          Let’s keep moving forward!
        </p>

      </div>
      
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <p style="color: #adb5bd; font-size: 12px; margin: 0;">
        © <script>document.write(new Date().getFullYear())</script> EIM. All rights reserved.
      </p>
    </div>

  </div>

</body>
</html>
    `;
};

// ==================================================================
// 5. MAIN LOGIC
// ==================================================================
async function checkAndNotifyInactiveUsers() {
  try {
    console.log('🔄 Checking for inactive users...');

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(DB_URI);
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);


    const usersToNotify = await User.find({
      lastLogin: { $lte: sevenDaysAgo, $gt: eightDaysAgo },
    });

    console.log(`🔎 Found ${usersToNotify.length} users inactive for 7 days.`);

    for (const user of usersToNotify) {
      const mailOptions = {
        from: `"Eila from EIM" <${EMAIL_USER}>`,
        to: user.email,
        subject: `Hi ${user.name}, I missed you at EIM 👀`,
        html: getEmailHtml(user.name)
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to: ${user.email}`);

      user.lastReengagementEmailSent = new Date();
      await user.save();
    }

  } catch (error) {
    console.error('❌ Error in mailer job:', error);
  }
}

cron.schedule('0 10 * * *', () => {
  console.log('⏰ Running daily inactivity check...');
  checkAndNotifyInactiveUsers();
});

console.log('🚀 loginLogsmail.js service started. Scheduled for daily check at 10:00 AM.');
