const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  title: String,
  responsibilities: [String],
  skills: [String],
  estimatedSalary: String,
  hiringPriority: String,
});

const InHousePlanSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
      index: true,
    },

    overview: String,

    roles: [RoleSchema],

    estimatedTimeline: String,
    estimatedCost: String,

    recommendedTechStack: [String],

    milestones: [String],

    aiInsight: String,

    generatedBy: {
      type: String,
      default: "AI",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InHousePlan", InHousePlanSchema);
