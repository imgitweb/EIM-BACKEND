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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to EIM</title>

  <!-- Bootstrap CSS -->
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
    rel="stylesheet"
  >
</head>

<body class="bg-light d-flex align-items-center min-vh-100">

  <div class="container">
    <div class="row justify-content-center">
      <div class="col-12 col-md-9 col-lg-7">

        <div class="card border-0 shadow-lg rounded-4">
          <div class="card-body p-4 p-md-5">

            <!-- Header -->
            <div class="text-center mb-4">
              
              <h2 class="fw-bold mt-3">Welcome to EIM</h2>
              <p class="text-muted mb-0">
                Let’s get you started
              </p>
            </div>

            <hr class="my-4">

            <!-- Content -->
            <p class="fs-6">
              Hello <strong>${startupName}</strong>,
            </p>

            <p class="text-muted">
              Your EIM account has been created successfully. You can now log in
              and start managing your workspace right away.
            </p>

            <!-- CTA -->
            <div class="d-grid gap-2 my-4">
              <a
                href="https://www.incubationmasters.com/login"
                class="btn btn-primary btn-lg rounded-3"
              >
                Access Your Dashboard
              </a>
            </div>

            <!-- Support -->
            <div class="alert alert-light border text-center small mb-0">
              Need help?
              <a href="mailto:eimsupport@imglobal.in" class="fw-semibold">
                eimsupport@imglobal.in
              </a>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-muted small mt-4">
          © ${new Date().getFullYear()} EIM. All rights reserved.
        </p>

      </div>
    </div>
  </div>

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
