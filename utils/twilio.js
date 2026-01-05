const twilio = require("twilio");

// ✅ Production + Sandbox dono me SAME rahega
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,   
  process.env.TWILIO_AUTH_TOKEN     
);

module.exports = client;
