const mongoose = require("mongoose");

const startupSchema = new mongoose.Schema(
  {
    // --- 1. EXISTING USER/AUTH FIELDS (KEPT AS IS) ---
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

    // --- 2. STARTUP BASIC INFO (KEPT AS IS) ---
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
    contactNumber: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },

    // --- 3. PITCH & PROBLEM (KEPT AS IS) ---
    elevatorPitch: {
      type: String,
      trim: true,
    },
    problemStatement: {
      type: String,
      trim: true,
    },
    solutionDescription: {
      type: String,
      trim: true,
    },

    // --- 4. BUSINESS DETAILS (MIXED OLD & NEW) ---
    industry: {
      type: String,
      trim: true,
    },
    startupStage: {
      type: String,
    },
    businessModel: {
      type: String,
      trim: true,
    },
    targetedAudience: {
      type: String,
      trim: true,
    },
    startedDate: {
      type: Date,
    },
    // ✅ NEW FIELDS ADDED
    revenueModel: {
      type: String,
      trim: true,
    },
    mvpLaunched: {
      type: Boolean,
      default: false,
    },
    companyRegistered: {
      type: Boolean,
      default: false,
    },

    // --- 5. LOCATION (MIXED OLD & NEW) ---
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    // ✅ NEW FIELDS ADDED
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    // --- 6. FINANCIALS (KEPT AS IS) ---
    revenueStarted: {
      type: Boolean,
      default: false,
    },
    bootstrapAvailable: {
      type: Boolean,
      default: false,
    },
    bootstrap: {
      currency: { type: String, default: "INR" },
      amount: { type: Number },
    },
    revenue: {
      generated: { type: Boolean, default: false },
      lastMonth: { type: String },
      amount: { type: Number },
      currency: { type: String, default: "INR" },
    },

    // --- 7. LEGAL & FILES (KEPT AS IS) ---
    foundersAgreementSigned: {
      type: Boolean,
      default: false,
    },
    foundersAgreementPdf: {
      type: String,
    },
    startupProfilePdf: {
      type: String,
    },

    // --- 8. SOCIAL LINKS (KEPT AS IS) ---
    socialLinks: [
      {
        platform: String,
        url: String,
      },
    ],

    // --- 9. METADATA (KEPT AS IS) ---
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StartupModel", startupSchema);
