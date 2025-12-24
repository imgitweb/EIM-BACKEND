const mongoose = require("mongoose");

const founderSchema = new mongoose.Schema({
  name: String,
  role: String,
  shares: Number,
  faceValue: Number,
});

const promoterSchema = new mongoose.Schema({
  name: String,
  shares: Number,
  shareClass: String,
});

const investorSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  type: String,
  preMoneyVal: Number,
  valuationCap: Number,
  discount: Number,
  interest: Number,
});

const esopSchema = new mongoose.Schema({
  percentage: Number,
  granted: Number,
});

const captableSchema = new mongoose.Schema(
  {
    founders: [founderSchema],
    promoters: [promoterSchema],
    investors: [investorSchema],
    esop: esopSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Captable", captableSchema);