const mongoose = require("mongoose");

const clientPersonaSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    profileName: {
      type: String,
      required: true,
      trim: true,
    },
    productService: {
      type: String,
      required: true,
      trim: true,
    },
    ageGroup: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Both"],
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    preferredPlatform: {
      type: String,
      required: true,
      trim: true,
    },
    techSavviness: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    contentPreference: {
      type: String,
      enum: ["Text", "Video", "Interactive"],
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("ClientPersona", clientPersonaSchema);
