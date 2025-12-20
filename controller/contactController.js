const sendEmail = require('../utils/sendEmails');
const sendConfirmation = require('../utils/sendEmail');

exports.handleContact = async (req, res) => {
  try {
    const { name, email, phone, interest, note, type } = req.body;
    console.log('Contact payload:', req.body);
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const subject = type === 'schedule' ? 'New Schedule Request' : type === 'demo' ? 'New Demo Request' : 'New Contact Request';
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

    const sent = await sendEmail({ email: adminEmail, subject: subject + ' - Incubation Masters', message });
    console.log('Admin email sent status:', sent);

    try {
      const confirmRes = await sendConfirmation(email, name);
      console.log('Confirmation email result:', confirmRes || 'ok');
    } catch (err) {
      console.error('Confirmation email failed:', err.message || err);
    }

    if (sent) return res.json({ success: true, message: 'Message sent' });
    return res.status(500).json({ success: false, message: 'Failed to send email' });
  } catch (error) {
    console.error('Contact handler error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
