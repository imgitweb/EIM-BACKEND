const mongoose = require("mongoose");

const SalesSchema = new mongoose.Schema(
  {
    startupId: {
      type: String,
      ref: "StartupModel",
      required: true, // Link to the user/startup
    },
    marketCalculationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketCalculation",
    },
    // Funnel Data
    reach: { type: Number, required: true },
    leads: { type: Number, default: 0 },
    qualified: { type: Number, default: 0 },
    deals: { type: Number, default: 0 },
    stays: { type: Number, default: 0 },

    // UI Display ke liye Percentages
    leadsPercent: { type: String, default: "0%" },
    qualifiedPercent: { type: String, default: "0%" },
    dealsPercent: { type: String, default: "0%" },
    staysPercent: { type: String, default: "0%" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesFunnel", SalesSchema);
