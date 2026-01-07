const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  budgetAllocation: { type: Number, required: true },
  platform: { type: String, required: true },
  outcome: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
});

const MarketingPlanSchema = new mongoose.Schema(
  {
    startupId: { type: String, required: true, index: true },
    budget: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    targetUsers: { type: Number, required: true },
    city: { type: String, required: true },
    campaigns: [CampaignSchema],
    conclusion: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketingPlan", MarketingPlanSchema);
