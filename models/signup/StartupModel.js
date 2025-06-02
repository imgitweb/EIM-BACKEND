const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const startupSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
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
      required: true,
      trim: true,
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
    industry: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      required: true,
      trim: true,
    },
    startupStage: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    elevatorPitch: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StartupModel", startupSchema);
