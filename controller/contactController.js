// controllers/contactController.js

const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmails');
const sendConfirmation = require('../utils/sendEmailContact');

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
      userType 
    } = req.body;

    console.log('Contact payload:', req.body);

    // Basic required validation
    if (!name || !email || !phone || !country || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, country, and user type.'
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
      console.error('Database duplicate check failed:', dbError.message);
    }

    if (isDuplicate) {
      return res.json({
        success: false,
        message: 'You are already in touch with us. Our team will contact you shortly!',
        alreadySubmitted: true
      });
    }

    // === SAVE TO DATABASE ===
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
        type: type || 'contact'
      });
      await newContact.save();
      console.log('New contact saved:', normalizedEmail);
    } catch (saveError) {
      console.error('Failed to save contact to DB:', saveError.message);
      // Continue — email is more important than DB save
    }

    // === SEND EMAILS ===
    const subjectType = type === 'schedule' 
      ? 'New Schedule Request' 
      : type === 'demo' 
        ? 'New Demo Request' 
        : 'New Contact Request';

    const message = `
      <h2>${subjectType}</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Country:</strong> ${country}</p>
      <p><strong>User Type:</strong> ${userType}</p>
      ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ''}
      <p><strong>Interested in:</strong> ${interest || 'Not specified'}</p>
      <p><strong>Message:</strong><br>${note || 'No message provided'}</p>
      <hr>
      <p><em>Sent from Incubation Masters website - ${new Date().toLocaleString()}</em></p>
    `;

    const adminEmail = process.env.CONTACT_RECEIVER || process.env.EMAIL_USER;

    let adminSent = false;
    try {
      adminSent = await sendEmail({
        email: adminEmail,
        subject: `${subjectType} - Incubation Masters`,
        message
      });
      console.log('Admin email sent:', adminSent);
    } catch (emailError) {
      console.error('Failed to send admin email:', emailError.message);
    }

    // Send confirmation to user
    try {
      await sendConfirmation(normalizedEmail, name);
      console.log('User confirmation email sent');
    } catch (err) {
      console.error('Confirmation email failed:', err.message);
    }

    // Final response
    return res.json({
      success: true,
      message: 'Message sent successfully! We will contact you soon.'
    });

  } catch (error) {
    console.error('Contact handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};