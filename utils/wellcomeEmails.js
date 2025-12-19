const nodemailer = require("nodemailer");

const welcomeEmail = async ({ email, startupName }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || "EIM Platform <no-reply@eim.com>",
      to: email,
      cc: "imcktiwari@gmail.com",
      subject: "Welcome to EIM – Your Account Is Ready",
      html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial;background:#f4f6f8;padding:20px">
        <table width="100%" align="center">
          <tr>
            <td align="center">
              <table width="600" style="background:#fff;padding:30px;border-radius:8px">
                <tr>
                  <td align="center">
                    <h2>Welcome to EIM 🎉</h2>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p>Hello <strong>${startupName}</strong>,</p>
                    <p>Your account has been successfully created on <strong>EIM</strong>.</p>

                    <p style="text-align:center;margin:30px 0">
                      <a href="${process.env.APP_URL}/login"
                        style="background:#4f46e5;color:#fff;padding:12px 25px;
                        text-decoration:none;border-radius:5px;font-weight:bold">
                        Login to Your Account
                      </a>
                    </p>

                    <p>If you need help, contact us at
                      <a href="mailto:support@eim.com">support@eim.com</a>
                    </p>

                    <p>Regards,<br><strong>EIM Team</strong></p>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#999;margin-top:10px">
                © ${new Date().getFullYear()} EIM. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

module.exports = welcomeEmail;
