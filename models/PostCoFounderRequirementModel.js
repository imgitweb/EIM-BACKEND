const mongoose = require("mongoose");

const coFounderSchema = new mongoose.Schema(
  {
    startupName: { type: String, required: true },
    website: { type: String, required: true },
    linkedin: String,
    country: { type: String, required: true },
    stage: { type: String, required: true },
    sector: String,
    elevatorPitch: String,
    problemStatement: String,
    founder1Name: { type: String, required: true },
    founder1LinkedIn: String,
    founder2Name: String,
    founder2LinkedIn: String,
    expertise: [String],
    otherExpertise: String,
    experienceLevel: { type: String, required: true },
    location: { type: String, required: true },
    equity: String,
    investment: String,
    idealCoFounder: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PostCoFounderRequirement", coFounderSchema);
