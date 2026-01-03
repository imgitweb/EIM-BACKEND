const express = require("express");
const router = express.Router();
const {
  sendWhatsAppDemo,
  sendWhatsAppTemplate
} = require("../../services/whatsapp.service");

/* ===============================
   🟢 DEMO ROUTE (SANDBOX)
   =============================== */
router.post("/send-demo", async (req, res) => {
  const { users, message } = req.body;

  if (!Array.isArray(users)) {
    return res.status(400).json({ error: "users must be an array" });
  }

  try {
    for (const phone of users) {
      await sendWhatsAppDemo(phone, message);
    }

    res.json({ success: true, message: "Sandbox demo WhatsApp sent" });
  } catch (err) {
    console.error("Demo Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   🔴 PRODUCTION ROUTE (TEMPLATES)
   =============================== */
router.post("/send-template", async (req, res) => {
  const { users, template, data } = req.body;

  if (!Array.isArray(users)) {
    return res.status(400).json({ error: "users must be an array" });
  }

  try {
    for (const phone of users) {
      await sendWhatsAppTemplate(phone, template, data);
    }

    res.json({ success: true, message: "Production WhatsApp sent" });
  } catch (err) {
    console.error("Template Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
