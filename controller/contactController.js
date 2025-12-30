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

    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // === DECLARE ADMIN EMAIL ONCE — USED IN BOTH BRANCHES ===
    const adminEmail = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;

    if (!adminEmail) {
      console.error("ADMIN EMAIL NOT CONFIGURED! Check .env: CONTACT_RECEIVER or EMAIL_USER");
    }

    // ===================================================================
    // CASE 1: NEWSLETTER SUBSCRIPTION
    // ===================================================================
    if (type === "newsletter" || interest === "newsletter") {
      let isDuplicate = false;
      try {
        const existingContact = await Contact.findOne({ email: normalizedEmail });
        if (existingContact) {
          isDuplicate = true;
        }
      } catch (dbError) {
        console.error("Duplicate check failed (newsletter):", dbError.message);
      }

      if (isDuplicate) {
        return res.json({
          success: true,
          message: "You're already subscribed! Thank you for your interest.",
          alreadySubscribed: true,
        });
      }

      const subscriberName = name?.trim() || "Subscriber";

      // Admin notification for newsletter
      const adminMessage = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e0e0e0;">
    <div style="background-color: #34a853; padding: 30px 20px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Newsletter Subscriber</h2>
      <p style="color: #e6f4ea; margin: 5px 0 0 0; font-size: 14px;">Someone subscribed via footer form</p>
    </div>
    <div style="padding: 30px;">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; width: 35%; color: #777; font-weight: 600; font-size: 14px;">Name</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px; font-weight: 500;">${subscriberName}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #34a853; font-size: 15px;">${normalizedEmail}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; color: #777; font-weight: 600; font-size: 14px; vertical-align: top;" colspan="2">Note</td>
        </tr>
        <tr>
          <td style="padding: 0 0 15px 0; color: #666; font-style: italic; font-size: 14px;" colspan="2">
            This user subscribed to the newsletter from the website footer.
          </td>
        </tr>
      </table>
    </div>
    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        Incubation Masters • ${new Date().toLocaleString()}
      </p>
    </div>
  </div>
</div>
`;

      if (adminEmail) {
        try {
          await sendEmail({
            email: adminEmail,
            subject: "New Newsletter Subscriber - Incubation Masters",
            message: adminMessage,
          });
          console.log("Newsletter admin notification sent:", normalizedEmail);
        } catch (emailError) {
          console.error("Failed to send newsletter admin email:", emailError.message);
        }
      }

      // Send welcome email to subscriber
      try {
        await sendConfirmation(normalizedEmail, subscriberName);
        console.log("Newsletter welcome email sent to:", normalizedEmail);
      } catch (err) {
        console.error("Newsletter welcome email failed:", err.message);
      }

      return res.json({
        success: true,
        message: "Thanks for subscribing! You'll hear from us soon.",
      });
    }

    // ===================================================================
    // CASE 2: REGULAR CONTACT FORM
    // ===================================================================

    if (!name || !phone || !country || !userType) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone, country, and user type.",
      });
    }

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
        message: "You are already in touch with us. Our team will contact you shortly!",
        alreadySubmitted: true,
      });
    }

    // Save to database
    try {
      const newContact = new Contact({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
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
    }

    // Admin email template for regular contact
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
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px; font-weight: 500;">${name.trim()}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Email</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #1a73e8; font-size: 15px;">${normalizedEmail}</td>
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
        ${organization ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Organization</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px;">${organization}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #777; font-weight: 600; font-size: 14px;">Interested In</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333; font-size: 15px;">${interest || "Not specified"}</td>
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

    // Send admin email (now safe because adminEmail is defined above)
    if (adminEmail) {
      try {
        await sendEmail({
          email: adminEmail,
          subject: `${subjectType} - Incubation Masters`,
          message,
        });
        console.log("Admin contact email sent successfully");
      } catch (emailError) {
        console.error("Failed to send admin contact email:", emailError.message);
      }
    } else {
      console.error("Cannot send admin email: No receiver configured in .env");
    }

    // Send confirmation to user
    try {
      await sendConfirmation(normalizedEmail, name.trim());
      console.log("User confirmation email sent");
    } catch (err) {
      console.error("Confirmation email failed:", err.message);
    }

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