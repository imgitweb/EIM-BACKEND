// models/Mrr.js
const mongoose = require("mongoose");

const mrrSchema = new mongoose.Schema({
  startup_id: { type: String, required: true },
  year: { type: Number, required: true },
  month: { type: String, required: true },
  no_customer: { type: Number, required: true },
  arpa: { type: Number, required: true },
});

const Mrr = mongoose.model("Mrr", mrrSchema);

module.exports = Mrr;
