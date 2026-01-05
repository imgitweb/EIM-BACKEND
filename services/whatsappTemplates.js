// 🔴 PRODUCTION CHANGE POINT #5
// HX_* ye sirf placeholder hai

module.exports = {
  WELCOME: {
    sid: "HX_REAL_WELCOME_TEMPLATE_SID", // 👈 Twilio Console se
    variables: ["name"]
  },
  OTP: {
    sid: "HX_REAL_OTP_TEMPLATE_SID",
    variables: ["otp"]
  },
  ALERT: {
    sid: "HX_REAL_ALERT_TEMPLATE_SID",
    variables: ["message"]
  }
};
