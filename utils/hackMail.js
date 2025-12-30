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

    // Brand Colors
    const brandColor = "#4F46E5";

    const mailOptions = {
      from: `"Startup MP Hackathon" <${process.env.EMAIL_USER}>`,
      to,
      bcc: "imcktiwari@gmail.com",
      subject: "Registration submitted: Startup MP Hack & Make 2026", // Updated Subject
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Submitted</title>
          <style>
            /* Reset & Basics */
            body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; }
            .wrapper { width: 100%; background-color: #f3f4f6; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            
            /* Header */
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
            .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px; }
            
            /* Content */
            .content { padding: 40px 30px; color: #374151; }
            .welcome-text { font-size: 18px; line-height: 1.6; margin-bottom: 25px; }
            .highlight { color: ${brandColor}; font-weight: 700; }
            
            /* Data Card */
            .card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
            .card-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e5e7eb; }
            .card-row:last-child { border-bottom: none; }
            .card-label { color: #6b7280; font-size: 14px; font-weight: 500; }
            .card-value { color: #111827; font-size: 14px; font-weight: 600; text-align: right; }
            
            /* Footer */
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { margin: 5px 0; font-size: 12px; color: #9ca3af; }
            .social-links { margin-bottom: 10px; }
            .social-links a { color: ${brandColor}; text-decoration: none; margin: 0 5px; font-size: 12px; font-weight: 600; }
            
            @media only screen and (max-width: 600px) {
              .content { padding: 20px; }
              .header { padding: 30px 20px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>Registration Submitted</h1> 
                <p>Startup MP: Hack & Make 2026</p>
              </div>

              <div class="content">
                <p class="welcome-text">
                  Hello <span class="highlight">${leaderName}</span>,<br><br>
                  Your team registration has been submitted. Get ready to build, innovate, and disrupt at Central India's biggest hackathon. Our screening team will be in touch with you for further proceeding, if your startup idea is shortlisted. Meanwhile stay updated about the hackathon in the following social media handles.
                </p>

                <div class="card">
                  <div class="card-row">
                    <span class="card-label">Team Leader</span>
                    <span class="card-value">${leaderName}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">Team Size</span>
                    <span class="card-value">${teamSize} Members</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">Chosen Track</span>
                    <span class="card-value" style="color: ${brandColor};">${track}</span>
                  </div>
                  <div class="card-row">
                    <span class="card-label">Reference ID</span>
                    <span class="card-value">#SMP-${Math.floor(
                      1000 + Math.random() * 9000
                    )}</span>
                  </div>
                </div>

              </div>

              <div class="footer">
                <div class="social-links">
                  <a target="__blank" href="https://www.incubationmasters.com/">Website</a> • 
                  <a target="__blank" href="https://www.instagram.com/incubationmasters?igsh=MWR0NmFuYW14ZXVlcg==">Instagram</a> • 
                  <a target="__blank" href="https://www.facebook.com/share/17g8PSgozV/">Facebook</a> • 
                  <a target="__blank" href="https://www.linkedin.com/company/incubationmasters/?viewAsMember=true">LinkedIn</a> • 
                  <a target="__blank" href="https://x.com/IncubationMS">Twitter</a>
                </div>
                <p>© 2026 Organized by Govt of Madhya Pradesh. Powered by Incubation Masters.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

module.exports = hackMail;
