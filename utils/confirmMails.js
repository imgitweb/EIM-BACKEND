const nodemailer = require("nodemailer");
require("dotenv").config(); // Ensure dotenv is installed and configured

// 1. Create Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 3. Send Function
const sendConfirmationEmail = async (userEmail, userName) => {
  // Added userName parameter
  try {
    const mailOptions = {
      from: `"HACK&MAKE 2026" <${process.env.EMAIL_USER}>`, // Use env variable for sender to match auth
      to: userEmail,
      subject: "Congratulations! You are Shortlisted for HACK&MAKE 2026",
      text: `Congratulations! You are shortlisted for HACK&MAKE 2026 on Jan 11, 2026.`,
      html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>HACK&MAKE 2026 Confirmation</title>
            <style>
                /* RESET STYLES */
                body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                table { border-collapse: collapse !important; }
                body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: 'Helvetica', 'Arial', sans-serif; background-color: #f4f4f4; color: #333333; }
                
                /* RESPONSIVE */
                @media screen and (max-width: 600px) {
                    .email-container { width: 100% !important; }
                    .details-table td { display: block; width: 100%; padding-bottom: 10px; }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4;">

            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        
                        <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                            
                            <tr>
                                <td align="center" style="background-color: #000000; padding: 30px;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">HACK&MAKE 2026</h1>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #2c3e50; margin-top: 0;">Congratulations! You are Shortlisted.</h2>
                                    
                                    <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                                        Dear ${
                                          userName || "Innovator"
                                        },<br><br> We are thrilled to inform you that your application for <strong>HACK&MAKE 2026</strong> has been successfully shortlisted! Out of hundreds of applications, your innovative potential stood out to our committee.
                                    </p>
                                    
                                    <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                                        On <strong>January 11, 2026</strong>, you will join an elite cohort of 300+ innovators at Jehan Numa Palace to build solutions addressing software, hardware, and export challenges.
                                    </p>

                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-left: 5px solid #2980b9; margin: 25px 0;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <h3 style="margin-top: 0; color: #2980b9;">Confirmed Participation Details</h3>
                                                <p style="margin: 5px 0; font-size: 15px;"><strong>Date:</strong> Sunday, January 11, 2026</p>
                                                <p style="margin: 5px 0; font-size: 15px;"><strong>Time:</strong> 8:00 AM - 8:00 PM (12hr Marathon)</p>
                                                <p style="margin: 5px 0; font-size: 15px;"><strong>Venue:</strong> Jehan Numa Palace, Bhopal</p>
                                                <p style="margin: 5px 0; font-size: 15px;"><strong>Awards:</strong> Jan 12, 2026 @ Ravindra Bhavan</p>
                                            </td>
                                        </tr>
                                    </table>

                                    <h3 style="color: #e74c3c;">Next Steps - Action Required</h3>
                                    <p style="font-size: 16px; line-height: 1.6;">To secure your seat, please complete the following by <strong>January 8, 2026</strong>:</p>
                                    <ul style="font-size: 16px; line-height: 1.6; color: #555555;">
                                        <li>Reply to this email with the word <strong>"CONFIRMED"</strong>.</li>
                                        <li>If participating as a team, submit team member details in your reply.</li>
                                        <li>Join the mandatory online orientation on <strong>Jan 9, 2026 @ 6:00 PM</strong>.</li>
                                    </ul>

                                    <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">

                                    <h3 style="color: #2c3e50;">What to Bring</h3>
                                    <ul style="font-size: 15px; line-height: 1.6; color: #555555;">
                                        <li><strong>Valid Government Photo ID</strong> (Mandatory).</li>
                                        <li>Laptop and chargers.</li>
                                        <li>Specific hardware/equipment needed for your project.</li>
                                    </ul>

                                    <p style="font-size: 14px; background-color: #fff3cd; padding: 10px; border-radius: 4px; color: #856404;">
                                        <strong>Note:</strong> Accommodation is the participant's responsibility. Meals & refreshments will be provided at the venue.
                                    </p>

                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="background-color: #eeeeee; padding: 20px; font-size: 14px; color: #777777;">
                                    <p style="margin: 0 0 10px 0;"><strong>HACK&MAKE 2026</strong></p>
                                    <p style="margin: 0 0 10px 0;">
                                        Questions? Contact us at <a href="mailto:info@hackmake.in" style="color: #2980b9;">info@hackmake.in</a><br>
                                        Priyanka Saxena: +91-9685740367
                                    </p>
                                    <p style="margin: 0; font-size: 12px;">&copy; 2026 Government of Madhya Pradesh & Incubation Masters.</p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>

        </body>
        </html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to: " + userEmail);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

module.exports = sendConfirmationEmail;
