// models/RiskAnalysis.js
const mongoose = require("mongoose");

const riskAnalysisSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    radarScores: Object,
    topRisks: Array,
    swot: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("RiskAnalysis", riskAnalysisSchema);
