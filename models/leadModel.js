// models/Lead.js
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  personName: { type: String, required: true },
  email: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  source: {
    type: String,
    enum: ["Google", "Social Media", "News Paper", "Other Source"],
    required: true,
  },
  interestedForService: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Lead", leadSchema);
