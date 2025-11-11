const mongoose = require("mongoose");

const TermSheetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // === Parties ===
    investors: [
      {
        name: { type: String, trim: true },
      },
    ],
    issuer: {
      name: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    founders: [
      {
        name: { type: String, trim: true },
      },
    ],
    businessDescription: { type: String, trim: true },

    // === Valuation & Funding ===
    preMoneyValuation: { type: Number, min: 0 },
    mandatoryInvestment: { type: Number, min: 0 },
    mandatoryEquity: { type: Number, min: 0, max: 100 },
    optionalInvestment: { type: Number, min: 0, default: 0 },
    totalShares: { type: Number, min: 1 },

    // === Instrument ===
    instrumentType: {
      type: String,
      enum: [
        "Equity shares",
        "Compulsorily Convertible Preference Shares (CCPS)",
        "Debentures",
        "Convertible Notes",
      ],
      default: "Equity shares",
    },

    // === Closing & Lock-in ===
    expectedClosingDate: { type: Date },
    founderLockIn: { type: Boolean, default: false },
    lockInDetails: { type: String, trim: true },

    // === NEW BROAD CONDITION FIELDS ===
    investmentAmount: { type: Number, min: 0 },
    instrumentPrice: { type: Number, min: 0 },
    liquidationPreference: { type: String, trim: true },
    votingRights: { type: String, trim: true },
    rightToMaintainCapital: { type: String, trim: true },
    transferRights: { type: String, trim: true },
    exitDate: { type: Date },
    tagAlongRights: { type: String, trim: true },
    antiDilutionProtection: { type: String, trim: true },
    protectiveProvisions: { type: String, trim: true },
    companyDebts: { type: String, trim: true },
    informationRights: { type: String, trim: true },
    dragAlongRights: { type: String, trim: true },
    representationsWarranties: { type: String, trim: true },
    governingLaw: {
      type: String,
      enum: ["Indian Law", "Singapore Law", "Delaware Law"],
      default: "Indian Law",
    },
    disputeResolution: { type: String, trim: true },
    existingInvestorRights: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
TermSheetSchema.index({ user: 1, createdAt: -1 });

const TermSheet = mongoose.model("TermSheet", TermSheetSchema);
module.exports = TermSheet;