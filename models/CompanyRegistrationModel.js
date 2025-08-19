// models/CompanyRegistrationModel.js
const mongoose = require("mongoose");

const CompanyRegistrationSchema = new mongoose.Schema({
  stage: String,
  founders: String,
  goal: String,
  fundraisingPlans: String,
  compliance: String,
  industry: String,
  recommendationType: String,
  primaryRecommendation: [String],
  alternativeOptions: [String],
  pros: [String],
  cons: [String],
}, { timestamps: true });

module.exports = mongoose.model("CompanyRegistration", CompanyRegistrationSchema);
