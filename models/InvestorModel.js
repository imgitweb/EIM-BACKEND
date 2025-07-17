const mongoose = require("mongoose");

const investorSchema = new mongoose.Schema({
  investorType: {
    type: String,
    required: true,
    enum: ["angel", "vc"],
  },
  // Common fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  linkedinProfile: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  stage: {
    type: String,
    required: true,
    enum: ["seed", "pre-seed", "early", "growth", "stage-agnostic"],
  },
  industry: {
    type: String,
    required: true,
    enum: [
      "ai/ml",
      "agritech",
      "consumer",
      "digital-entertainment",
      "edtech",
      "fintech",
      "healthtech",
      "media",
      "tech",
      "mobility",
      "saas",
      "industry-agnostic",
      "deep tech",
    ],
  },
  // Angel Investor specific fields
  investorName: {
    type: String,
    required: true,
    trim: true,
  },

  firmLogo: {
    type: String,
    trim: true,
  },
  pointOfContact: {
    type: String,
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 20; // Maximum 20 skills allowed
      },
      message: "Cannot have more than 20 skills",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Investor", investorSchema);
