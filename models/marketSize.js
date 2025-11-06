const mongoose = require("mongoose");

const MarketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productService: {
      type: String,
      required: true,
      trim: true,
    },
    industryType: {
      type: String,
      required: true,
      trim: true,
    },
    targetGeography: {
      type: String,
      required: true,
      trim: true,
    },
    customerSegment: {
      type: String,
      required: true,
      trim: true,
    },
    averagePrice: {
      type: String,
      required: true,
      trim: true,
    },
    revenueModel: {
      type: String,
      enum: ["subscription", "one-time"],
      default: "subscription",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MarketSize", MarketSchema);
