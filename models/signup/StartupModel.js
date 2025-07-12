const mongoose = require("mongoose");

const startupSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,

      trim: true,
    },
    lastName: {
      type: String,

      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    selectedPlan: {
      type: String,
      default: "alpha",
    },
    startupName: {
      type: String,
      required: [true, "Startup name is required"],
      trim: true,
      unique: true,
    },
    contactPersonName: {
      type: String,

      trim: true,
    },
    country: {
      type: String,

      trim: true,
    },
    state: {
      type: String,

      trim: true,
    },
    industry: {
      type: String,

      trim: true,
    },
    website: {
      type: String,

      trim: true,
    },
    startupStage: {
      type: String,
    },
    contactNumber: {
      type: String,

      trim: true,
    },
    elevatorPitch: {
      type: String,

      trim: true,
    },
    logoUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StartupModel", startupSchema);
