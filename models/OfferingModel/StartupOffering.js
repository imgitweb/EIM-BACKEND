const mongoose = require("mongoose");

const offeringSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    product_category: { type: String, required: true },
    product_name: { type: String, required: true },
    currency: { type: String, default: "INR" },
    ideal_price: { type: Number, required: true },
    price_deal_type: { type: String, required: true }, // Subscription / One-time
    average_deal_type: { type: String, required: true }, // Low / Medium / High
    average_deal_value: { type: Number, required: true },
    product_service_description: { type: String, maxlength: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StartupOffering", offeringSchema);
