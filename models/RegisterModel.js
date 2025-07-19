// models/UimRegister.js
const mongoose = require("mongoose");

const uimRegisterSchema = new mongoose.Schema({
  sectors: [String],
  focus: { type: String, required: true },
  market: { type: String, required: true },
  interest: { type: String, required: true },
  skills: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("UimRegister", uimRegisterSchema);
