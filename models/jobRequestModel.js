// models/JobRequest.js
const mongoose = require("mongoose");

const jobRequestSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  experienceRequired: { type: Number, min: 1, required: true }, // Minimum of 1 year
  skills: { type: String, required: true },
  jobLocation: { type: String, required: true },
  salary: { type: String, required: true }, // String to handle ranges or specific amounts
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JobRequest", jobRequestSchema);
