const mongoose = require("mongoose");

const postCoFounderSchema = new mongoose.Schema(
  {
    coFounderRole: {
      type: String,
      enum: [
        "Tech Co-Founder",
        "Business / Strategy Co-Founder",
        "Marketing & Growth Co-Founder",
        "Operations Co-Founder",
        "Finance / Fundraising Co-Founder",
      ],
      required: true,
    },
    commitmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Advisory"],
      required: true,
    },
    equityOffering: {
      type: String,
      enum: ["1-5%", "5-10%", "10-20%", "20%+", "To be discussed"],
      required: true,
    },
    financialCommitment: {
      type: String,
      enum: [
        "No financial contribution expected",
        "Open to minor contribution (for expenses)",
        "Open to investing at later stage",
        "Equity-only (no cash contribution)",
        "Open to discussion",
      ],
      required: true,
    },
    locationPreference: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site", "Location Flexible"],
      required: true,
    },
    opportunityBrief: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PostCoFounder", postCoFounderSchema);