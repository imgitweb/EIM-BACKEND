require("dotenv").config();
const nodemailer = require("nodemailer");

const sendEmail = async (recipientEmail, userName) => {
  console.log("---> Sending email to:", recipientEmail, userName);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 1. Text Version (Clean, no icons)
  const textVersion = `Hello ${userName},

Thank you for reaching out to us. We truly appreciate you taking the time to connect.

Our team has received your message and will review it shortly. One of our representatives will get back to you as soon as possible.

Meanwhile, stay connected with us:
Facebook: https://www.facebook.com/IncubationMasters/
LinkedIn: https://www.linkedin.com/company/incubationmasters/
Twitter: https://x.com/IncubationMS
Instagram: https://www.instagram.com/incubationmasters/

Warm regards,
Team Incubation Masters`;

  // 2. HTML Version (Responsive, Clean, No Icons)
  const htmlVersion = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You</title>
    <style>
        /* Base Resets */
        body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f6f8; }
        table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        
        /* Responsive Media Queries */
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content-padding { padding: 20px !important; }
            .mobile-stack { display: block !important; width: 100% !important; margin-bottom: 10px; }
            .social-link { word-break: break-all; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8;">
        <tr>
            <td align="center" style="padding: 40px 10px;">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" class="container">
                    
                    <tr>
                        <td align="center" style="background-color: #6a1b9a; padding: 30px 20px;">
                            <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Thank You!</h2>
                        </td>
                    </tr>

                    <tr>
                        <td class="content-padding" style="padding: 40px 40px 20px 40px; color: #333333; font-size: 16px; line-height: 1.6;">
                            <p style="margin-top: 0;">Dear <strong>${userName}</strong>,</p>

                            <p>Thank you for reaching out to us. We truly appreciate your interest and the time you took to connect.</p>

                            <p>Our team has successfully received your message and will review it shortly. One of our representatives will get back to you as soon as possible.</p>
                            
                            <div style="margin: 30px 0; border-top: 1px solid #e0e0e0;"></div>

                            <p style="margin-bottom: 15px; font-weight: bold; color: #6a1b9a;">Stay Connected With Us:</p>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 8px;">
                                        <strong style="margin-right: 5px;">Facebook:</strong> 
                                        <a href="https://www.facebook.com/IncubationMasters/" style="color: #007bff; text-decoration: none; font-size: 14px;" class="social-link">facebook.com/IncubationMasters</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 8px;">
                                        <strong style="margin-right: 5px;">LinkedIn:</strong> 
                                        <a href="https://www.linkedin.com/company/incubationmasters/posts/?feedView=all" style="color: #007bff; text-decoration: none; font-size: 14px;" class="social-link">linkedin.com/company/IncubationMasters</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 8px;">
                                        <strong style="margin-right: 5px;">Twitter:</strong> 
                                        <a href="https://x.com/IncubationMS" style="color: #007bff; text-decoration: none; font-size: 14px;" class="social-link">x.com/IncubationMasters</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 8px;">
                                        <strong style="margin-right: 5px;">Instagram:</strong> 
                                        <a href="https://www.instagram.com/incubationmasters/?hl=en" style="color: #007bff; text-decoration: none; font-size: 14px;" class="social-link">instagram.com/IncubationMasters</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top: 30px; font-size: 16px;">
                                Warm regards,<br>
                                <strong>Team Incubation Masters</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #f9f9f9; padding: 20px; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
                            &copy; ${new Date().getFullYear()} Incubation Masters. All rights reserved.
                        </td>
                    </tr>

                </table>

                </td>
        </tr>
    </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"Team Incubation Masters" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "Thank You for Connecting With Us",
    text: textVersion,
    html: htmlVersion,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendEmail;