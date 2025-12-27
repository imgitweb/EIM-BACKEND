// controllers/contactController.js

const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmails");
const sendConfirmation = require("../utils/sendEmailContact");

exports.handleContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      interest,
      note,
      type,
      country,
      organization,
      userType,
    } = req.body;

    console.log("Contact payload:", req.body);

    // Basic required validation
    if (!name || !email || !phone || !country || !userType) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone, country, and user type.",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // === DUPLICATE CHECK ===
    let isDuplicate = false;
    try {
      const existingContact = await Contact.findOne({ email: normalizedEmail });
      if (existingContact) {
        isDuplicate = true;
      }
    } catch (dbError) {
      console.error("Database duplicate check failed:", dbError.message);
    }

    if (isDuplicate) {
      return res.json({
        success: false,
        message:
          "You are already in touch with us. Our team will contact you shortly!",
        alreadySubmitted: true,
      });
    }

    // === SAVE TO DATABASE ===
    try {
      const newContact = new Contact({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone,
        country: country.trim(),
        userType: userType.trim(),
        organization: organization ? organization.trim() : null,
        interest: interest || null,
        note: note || null,
        type: type || "contact",
      });
      await newContact.save();
      console.log("New contact saved:", normalizedEmail);
    } catch (saveError) {
      console.error("Failed to save contact to DB:", saveError.message);
      // Continue — email is more important than DB save
    }

    // === SEND EMAILS ===
    const subjectType =
      type === "schedule"
        ? "New Schedule Request"
        : type === "demo"
        ? "New Demo Request"
        : "New Contact Request";

    const message = `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e0e0e0;">
    
    <div style="background-color: #1a73e8; padding: 30px 20px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${subjectType}</h2>
      <p style="color: #e8f0fe; margin: 5px 0 0 0; font-size: 14px;">New inquiry via Incubation Masters</p>
    </div>

    <div style="padding: 30px;">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
        
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; width: 35%; color: #777; font-weight: 600; font-size: 14px;">Name</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px; font-weight: 500;">${name}</td>
        </tr>
        
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #1a73e8; font-size: 15px;">${email}</td>
        </tr>

        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Phone</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px;">${phone}</td>
        </tr>

        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Country</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px;">${country}</td>
        </tr>

        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">User Type</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px;">
            <span style="background-color: #e8f0fe; color: #1a73e8; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${userType}</span>
          </td>
        </tr>

        ${
          organization
            ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Organization</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px;">${organization}</td>
        </tr>`
            : ""
        }

        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Interested In</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px;">${
            interest || "Not specified"
          }</td>
        </tr>

        <tr>
          <td style="padding: 20px 0 5px 0; color: #777; font-weight: 600; font-size: 14px; vertical-align: top;" colspan="2">Message</td>
        </tr>
        <tr>
          <td style="padding: 0 0 15px 0; color: #333; line-height: 1.6; font-size: 15px;" colspan="2">
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #1a73e8;">
              ${note || "No message provided"}
            </div>
          </td>
        </tr>

      </table>
    </div>

    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        Sent from <strong>Incubation Masters</strong> website • ${new Date().toLocaleString()}
      </p>
    </div>

  </div>
</div>
`;

    const adminEmail = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;

    let adminSent = false;
    try {
      adminSent = await sendEmail({
        email: adminEmail,
        subject: `${subjectType} - Incubation Masters`,
        message,
      });
      console.log("Admin email sent:", adminSent);
    } catch (emailError) {
      console.error("Failed to send admin email:", emailError.message);
    }

    // Send confirmation to user
    try {
      await sendConfirmation(normalizedEmail, name);
      console.log("User confirmation email sent");
    } catch (err) {
      console.error("Confirmation email failed:", err.message);
    }

    // Final response
    return res.json({
      success: true,
      message: "Message sent successfully! We will contact you soon.",
    });
  } catch (error) {
    console.error("Contact handler error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
