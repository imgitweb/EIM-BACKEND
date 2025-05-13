const mongoose = require("mongoose");

const UserLogSchema = new mongoose.Schema({
  userId: { type: String, required: false }, // Optional user ID
  ipAddress: { type: String, required: true },
  event: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserLog", UserLogSchema);
