const mongoose = require("mongoose");

const TermSheetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // === COMPANY DETAILS ===
    companyName: {
      type: String,
      trim: true,
      required: true,
    },
    cin: {
      type: String,
      trim: true,
    },
    registeredAddress: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    businessDescription: {
      type: String,
      trim: true,
    },

    // === INVESTOR DETAILS ===
    investorName: {
      type: String,
      trim: true,
      required: true,
    },
    investorType: {
      type: String,
      enum: ["Angel", "VC Fund", "Family Office", "Accelerator"],
      default: "Angel",
    },
    investors: [
      {
        name: { type: String, trim: true },
      },
    ],

    // === INVESTMENT DETAILS ===
    instrumentType: {
      type: String,
      enum: [
        "Equity Shares",
        "CCPS",
        "CCD",
        "SAFE-India",
        "Convertible Notes",
      ],
      default: "Equity Shares",
    },
    roundType: {
      type: String,
      enum: ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Series D"],
      default: "Seed",
    },
    investmentAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    preMoneyValuation: {
      type: Number,
      min: 0,
      required: true,
    },
    postMoneyValuation: {
      type: Number,
      min: 0,
    },
    totalSharesPre: {
      type: Number,
      min: 1,
      required: true,
    },
    equityDilution: {
      type: Number,
      min: 0,
      max: 100,
    },
    pricePerShare: {
      type: Number,
      min: 0,
    },
    sharesToBeIssued: {
      type: Number,
      min: 0,
    },

    // === INVESTMENT TERMS ===
    closingDate: {
      type: Date,
      required: true,
    },
    conditionsPrecedent: {
      type: String,
      trim: true,
    },
    conditionsSubsequent: {
      type: String,
      trim: true,
    },

    // === INSTRUMENT-SPECIFIC TERMS ===
    // Stored as a flexible object to handle all instrument types
    instrumentSpecificTerms: {
      // === EQUITY SHARES ===
      liquidationPreference: { type: String, trim: true },
      antiDilution: { type: String, trim: true },
      proRataRights: { type: String, trim: true },
      dragAlongThreshold: { type: String, trim: true },
      tagAlongRights: { type: String, trim: true },
      inspectionRights: { type: String, trim: true },

      // === CCPS ===
      ccpsSeries: { type: String, trim: true },
      dividendRate: { type: Number, min: 0 },
      conversionRatio: { type: String, trim: true },
      conversionTrigger: { type: String, trim: true },
      boardRepresentation: { type: String, trim: true },
      preemptiveRights: { type: String, trim: true },

      // === CCD ===
      interestRate: { type: Number, min: 0 },
      tenure: { type: String, trim: true },
      conversionMethod: { type: String, trim: true },
      securityType: { type: String, trim: true },
      interestPaymentType: { type: String, trim: true },
      reportingFrequency: { type: String, trim: true },

      // === SAFE-INDIA ===
      safeType: { type: String, trim: true },
      discountRate: { type: Number, min: 0, max: 100 },
      valuationCap: { type: Number, min: 0 },
      mfnClause: { type: String, trim: true },
      longStopDate: { type: String, trim: true },

      // === CONVERTIBLE NOTES ===
      conversionDiscount: { type: Number, min: 0, max: 100 },
      maturityPeriod: { type: String, trim: true },
      conversionEvent: { type: String, trim: true },
      repaymentOption: { type: String, trim: true },
      reportingRights: { type: String, trim: true },
    },

    // === INVESTOR RIGHTS - GENERAL ===
    boardSeat: {
      type: Boolean,
      default: false,
    },
    boardSeatCount: {
      type: Number,
      min: 0,
    },
    boardObserver: {
      type: Boolean,
      default: false,
    },
    informationRights: {
      type: String,
      trim: true,
    },
    votingRights: {
      type: String,
      trim: true,
    },
    protectiveProvisions: {
      type: String,
      trim: true,
    },

    // === COMPANY OBLIGATIONS ===
    esopPoolSize: {
      type: Number,
      min: 0,
      max: 100,
    },
    complianceRequirements: {
      type: String,
      trim: true,
    },
    managementCovenants: {
      type: String,
      trim: true,
    },
    reportingObligations: {
      type: String,
      trim: true,
    },
    debtRestrictions: {
      type: String,
      trim: true,
    },
    founderCommitment: {
      type: Boolean,
      default: false,
    },
    vestingSchedule: {
      type: String,
      trim: true,
    },

    // === REPRESENTATIONS & WARRANTIES ===
    companiesActCompliance: {
      type: Boolean,
      default: false,
    },
    femaCompliance: {
      type: Boolean,
      default: false,
    },
    noLitigation: {
      type: Boolean,
      default: false,
    },
    noOtherTermsheet: {
      type: Boolean,
      default: false,
    },
    ipOwnership: {
      type: Boolean,
      default: false,
    },
    founderDocs: {
      type: Boolean,
      default: false,
    },
    taxCompliance: {
      type: Boolean,
      default: false,
    },

    // === LEGACY FIELDS (for backward compatibility) ===
    issuer: {
      name: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    founders: [
      {
        name: { type: String, trim: true },
      },
    ],
    mandatoryInvestment: { type: Number, min: 0 },
    mandatoryEquity: { type: Number, min: 0, max: 100 },
    optionalInvestment: { type: Number, min: 0, default: 0 },
    totalShares: { type: Number, min: 1 },
    expectedClosingDate: { type: Date },
    founderLockIn: { type: Boolean, default: false },
    lockInDetails: { type: String, trim: true },
    instrumentPrice: { type: Number, min: 0 },
    rightToMaintainCapital: { type: String, trim: true },
    transferRights: { type: String, trim: true },
    exitDate: { type: Date },
    liquidationPreference: { type: String, trim: true },
    antiDilutionProtection: { type: String, trim: true },
    companyDebts: { type: String, trim: true },
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

TermSheetSchema.index({ user: 1, createdAt: -1 });

const TermSheet = mongoose.model("TermSheet", TermSheetSchema);
module.exports = TermSheet;