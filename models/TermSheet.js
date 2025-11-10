const mongoose = require("mongoose");

const TermSheetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    investors: [
      {
        name: String,
      },
    ],
    issuer: {
      name: String,
      address: String,
    },
    founders: [
      {
        name: String,
      },
    ],
    businessDescription: String,
    preMoneyValuation: Number,
    mandatoryInvestment: Number,
    mandatoryEquity: Number,
    optionalInvestment: Number,
    optionalEquity: Number,
    totalShares: Number,
    instrumentType: String,
    expectedClosingDate: Date,
    founderLockIn: Boolean,
    lockInDetails: String,
  },
  {
    timestamps: true, 
  }
);

const TermSheet = mongoose.model("TermSheet", TermSheetSchema);
module.exports = TermSheet;