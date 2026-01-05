const client = require("../utils/twilio");
const templates = require("./whatsappTemplates");

/* ======================================================
   🟢 SANDBOX / DEMO FUNCTION
   - Free text allowed
   - Sir / client demo ke liye
   ====================================================== */

async function sendWhatsAppDemo(to, message) {
  if (!message) {
    throw new Error("Message body is required for demo");
  }

  return await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM, 
    to: `whatsapp:${to}`,
    body: message
  });
}

/* ======================================================
   🔴 PRODUCTION FUNCTION (TEMPLATE BASED)
   - body ❌
   - contentSid ✅
   ====================================================== */
   
async function sendWhatsAppTemplate(to, templateName, data) {

  // ✅ Template name validate
  const template = templates[templateName];
  if (!template) {
    throw new Error("Invalid WhatsApp template name");
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error("Template variables data is required");
  }

  return await client.messages.create({
    // 🔴 Production: Approved WhatsApp Business number
    from: process.env.TWILIO_WHATSAPP_FROM,

    // ✅ Receiver
    to: `whatsapp:${to}`,

    // 🔴 Approved template SID
    contentSid: template.sid,

    // 🔴 Template variables {{1}}, {{2}}
    contentVariables: JSON.stringify(data)
  });
}

module.exports = {
  sendWhatsAppDemo,
  sendWhatsAppTemplate
};
