
const mongoose = require("mongoose");

const UimRegisterSchema = new mongoose.Schema({
  sectors: [String],
  focus: String,
  market: String,
  interest: String,
  skills: String,
}, { timestamps: true });

module.exports = mongoose.model("uimregisters", UimRegisterSchema);
