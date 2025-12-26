// controllers/contact.js  (or wherever your file is)

const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmails');
const sendConfirmation = require('../utils/sendEmailContact');

exports.handleContact = async (req, res) => {
  try {
    const { name, email, phone, interest, note, type } = req.body;

    console.log('Contact payload:', req.body);

    // Basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and phone.'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // === DUPLICATE CHECK (Safe with try-catch) ===
    let isDuplicate = false;
    try {
      const existingContact = await Contact.findOne({ email: normalizedEmail });
      if (existingContact) {
        isDuplicate = true;
      }
    } catch (dbError) {
      console.error('Database check failed (non-critical):', dbError.message);
      // Do NOT crash — continue as new lead (better to get duplicate than lose lead)
    }

    // If duplicate found → return friendly message
    if (isDuplicate) {
      return res.json({
        success: false,
        message: 'You are already in touch with us. Our team will contact you shortly!',
        alreadySubmitted: true  // Optional flag for frontend
      });
    }

    // === SAVE TO DATABASE (Safe) ===
    try {
      const newContact = new Contact({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        interest: interest || null,
        note: note || null,
        type: type || 'contact'
      });
      await newContact.save();
      console.log('New contact saved:', normalizedEmail);
    } catch (saveError) {
      console.error('Failed to save contact to DB:', saveError.message);
      // Continue anyway — saving is not critical for email delivery
    }

    // === SEND EMAILS (Your original logic preserved) ===
    const subject = type === 'schedule'
      ? 'New Schedule Request'
      : type === 'demo'
        ? 'New Demo Request'
        : 'New Contact Request';

    const message = `
      <h3>${subject}</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Interest:</strong> ${interest || 'N/A'}</p>
      <p><strong>Note:</strong> ${note || 'N/A'}</p>
      <p><em>Sent from website contact form</em></p>
    `;

    const adminEmail = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;

    let adminSent = false;
    try {
      adminSent = await sendEmail({
        email: adminEmail,
        subject: subject + ' - Incubation Masters',
        message
      });
      console.log('Admin email sent status:', adminSent);
    } catch (emailError) {
      console.error('Failed to send admin email:', emailError.message);
    }

    // Send confirmation to user (non-blocking)
    try {
      const confirmRes = await sendConfirmation(normalizedEmail, name);
      console.log('Confirmation email result:', confirmRes || 'ok');
    } catch (err) {
      console.error('Confirmation email failed:', err.message || err);
    }

    // Final response
    if (adminSent) {
      return res.json({
        success: true,
        message: 'Message sent successfully!'
      });
    } else {
      // Even if email failed, we don't want to alarm user too much
      return res.json({
        success: true,
        message: 'Request received! We will contact you soon.'
      });
    }

  } catch (error) {
    console.error('Contact handler critical error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};