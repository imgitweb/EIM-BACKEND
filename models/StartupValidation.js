const mongoose = require("mongoose");

const startupValidationSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel", 
      required: true,
    },

    score: Number,

    strengths: [String],
    weaknesses: [String],
    opportunities: [String],
    risks: [String],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StartupValidation",
  startupValidationSchema
);
