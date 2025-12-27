const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }, // e.g., "Digital", "Offline"
  description: { type: String, required: true },
  budgetAllocation: { type: Number, required: true },
  platform: { type: String, required: true }, // e.g., "Instagram", "Billboards"
  outcome: { type: String, required: true }, // e.g., "500 Leads"
  icon: { type: String, required: true }, // "Megaphone", "Users", "MapPin", "Share2"
});

const MarketingPlanSchema = new mongoose.Schema(
  {
    startupId: { type: String, required: true, index: true }, // Linked to the user
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
