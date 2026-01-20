const nodemailer = require("nodemailer");

// --- Helper Function to Replace Variables in HTML ---
const replacePlaceholders = (html, replacements) => {
  let finalHtml = html;
  for (const key in replacements) {
    // This looks for {{Key}} in the string and replaces it
    finalHtml = finalHtml.replace(new RegExp(`{{${key}}}`, 'g'), replacements[key]);
  }
  return finalHtml;
};

// --- HTML Templates ---
// FIXED: Removed `${}` and used strictly `{{Key}}` so JS doesn't crash
const TEMPLATES = {
  welcome: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Welcome</title></head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',sans-serif;">
  <div style="background-color:#f8f9fa;padding:40px 20px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #eeeeee;overflow:hidden;">
      <div style="padding:40px;">
        <div style="text-align:center;margin-bottom:30px;">
          <h2 style="color:#212529;font-size:24px;margin:0;">👋 Welcome to EIM</h2>
          <p style="color:#6c757d;">Elevate by Incubation Masters</p>
        </div>
        <hr style="border:none;border-top:1px solid #dee2e6;margin:30px 0;">
        <p style="color:#212529;font-size:16px;line-height:1.6;">
          Hi <strong>{{Name}}</strong>, great to have you onboard.<br>
          Your account has been successfully created.
        </p>
        <div style="background-color:#f8f9fa;border-left:4px solid #0d6efd;padding:15px;margin-bottom:25px;">
          <p style="margin:0;color:#495057;">✅ <strong>Next step:</strong> Complete your startup profile.</p>
        </div>
        <div style="text-align:center;margin:30px 0;">
          <a href="{{Login_Link}}" style="background-color:#0d6efd;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">👉 Access Dashboard</a>
        </div>
        <p style="color:#212529;">I'm excited to help you build, scale, and win.<br><br>– <strong>Eila</strong> (Your AI-CoFounder)</p>
      </div>
      <div style="background-color:#f1f3f5;padding:15px;text-align:center;"><p style="margin:0;font-size:14px;color:#6c757d;">Need help? <a href="mailto:eimsupport@imglobal.in" style="color:#0d6efd;">eimsupport@imglobal.in</a></p></div>
    </div>
    <div style="text-align:center;margin-top:25px;"><p style="color:#adb5bd;font-size:12px;">© 2026 EIM. All rights reserved.</p></div>
  </div>
</body></html>`,

  profileReminder: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',sans-serif;">
  <div style="background-color:#f8f9fa;padding:40px 20px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #eeeeee;overflow:hidden;">
      <div style="padding:40px;">
        <div style="text-align:center;margin-bottom:30px;">
           <h2 style="color:#212529;font-size:24px;font-weight:700;">Action Required <span style="color:#ffc107;">⚠️</span></h2>
        </div>
        <p style="color:#212529;font-size:16px;line-height:1.6;">Hi <strong>{{Name}}</strong> 👋<br>I noticed your EIM profile is still incomplete.</p>
        <div style="background-color:#f0f8ff;border:1px solid #cfe2ff;border-radius:8px;padding:20px;margin-bottom:25px;">
          <p style="margin:0 0 10px 0;font-weight:600;color:#084298;">Completing it helps us:</p>
          <ul style="margin:0;padding-left:20px;color:#495057;"><li>Match you with the right mentors</li><li>Recommend relevant programs</li><li>Track your startup progress</li></ul>
        </div>
        <p style="text-align:center;color:#6c757d;font-size:14px;">⏱ Takes less than 5 minutes</p>
        <div style="text-align:center;margin-bottom:30px;">
          <a href="{{Profile_Link}}" style="background-color:#0d6efd;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">👉 Complete Now</a>
        </div>
      </div>
    </div>
  </div>
</body></html>`,

  taskReminder: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',sans-serif;">
  <div style="background-color:#f8f9fa;padding:40px 20px;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;border:1px solid #eeeeee;overflow:hidden;">
      <div style="padding:40px;">
        <div style="text-align:center;margin-bottom:25px;">
           <h2 style="color:#212529;font-size:22px;font-weight:700;">⏰ Quick reminder from EIM</h2>
        </div>
        <div style="background-color:#fff8e1;border:1px dashed #ffc107;border-radius:8px;padding:20px;margin-bottom:25px;text-align:center;">
          <p style="margin:0 0 5px 0;color:#6c757d;font-size:13px;text-transform:uppercase;">Pending Task</p>
          <p style="margin:0;color:#212529;font-size:18px;font-weight:700;">“{{Task_Title}}”</p>
        </div>
        <p style="color:#495057;font-size:16px;text-align:center;margin-bottom:25px;">Completing it helps us unlock your next milestone and mentor inputs.</p>
        <div style="text-align:center;margin-bottom:30px;">
          <a href="{{Task_Link}}" style="background-color:#0d6efd;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">👉 Finish Here</a>
        </div>
        <div style="text-align:center;"><p style="color:#6c757d;font-size:14px;">Need help? Just reply <strong>HELP</strong></p></div>
      </div>
    </div>
  </div>
</body></html>`
};

// --- Main Email Function ---
const welcomeEmail = async ({ email, startupName, taskTitle }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Base Data for replacements
  const baseData = {
    Name: startupName,
    Login_Link: "https://www.incubationmasters.com/login",
    Profile_Link: "https://www.incubationmasters.com/app-profile",
    Task_Title: taskTitle || "Your Startup Overview",
    Task_Link: "https://www.incubationmasters.com/submit-idea"
  };

  // Helper to send individual mail
  const sendMail = async (subject, htmlTemplate) => {
    try {
      const htmlContent = replacePlaceholders(htmlTemplate, baseData);
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "EIM Platform <no-reply@eim.com>",
        to: email,
        subject: subject,
        html: htmlContent,
      });
      console.log(`✅ Email sent: "${subject}" to ${email}`);
    } catch (err) {
      console.error(`❌ Failed to send "${subject}":`, err);
    }
  };

  try {
    // 1. Send WELCOME Email (IMMEDIATELY)
    await sendMail("Welcome to EIM – Your Account Is Ready", TEMPLATES.welcome);

    // 2. Schedule PROFILE REMINDER (After 3 Minutes)
    setTimeout(() => {
      sendMail("Action Required: Complete your EIM Profile ⚠️", TEMPLATES.profileReminder);
    }, 180000);

    // 3. Schedule TASK REMINDER (After 5 Minutes)
    setTimeout(() => {
      sendMail("⏰ Quick reminder: Pending Task", TEMPLATES.taskReminder);
    }, 300000);

    return true;

  } catch (error) {
    console.error("Critical Email Error:", error);
    return false;
  }
};

module.exports = welcomeEmail;