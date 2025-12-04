const mongoose = require("mongoose");

const StoryPointSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ["Must-Have", "Should-Have", "Could-Have"], default: "Must-Have" },
  source: { type: String, enum: ["story_point", "custom", "auto"], default: "story_point" }
});

const MVPConfigSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },

    // MVP type chosen (e.g. landing_page)
    productTypeId: {
      type: String,
      required: true,
    },

    // Human readable label (e.g. Single Landing Page)
    productTypeLabel: {
      type: String,
      required: true,
    },

    // All selected story points
    storyPoints: {
      type: [StoryPointSchema],
      default: [],
    },

    // AI generated scope text
    scopeText: {
      type: String,
      default: "",
    },

    // Whether scope was generated
    scopeGenerated: {
      type: Boolean,
      default: false,
    },

    // Optional: version the configuration
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MVPConfig", MVPConfigSchema);
