const mongoose = require("mongoose");

const MarketCalculationSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    productService: { type: String, required: true },
    targetGeography: { type: String, required: true },
    customerSegment: { type: String, required: true },
    customerSegmentDetails: { type: String },
    currency: { type: String, default: "INR" },
    averagePrice: { type: Number, required: true },

    samPercent: { type: Number, required: true },
    somPercent: { type: Number, required: true },

    totalCustomers: { type: Number, required: true },
    tam: { type: Number, required: true }, // Calculated
    sam: { type: Number, required: true }, // Calculated
    som: { type: Number, required: true }, // Calculated
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketCalculation", MarketCalculationSchema);
