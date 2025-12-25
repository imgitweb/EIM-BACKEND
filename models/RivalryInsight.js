const mongoose = require("mongoose");

const RivalryInsightSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },

    scope: {
      type: String,
      enum: ["region", "state", "country", "global"],
      required: true,
    },

    result: {
      startup_name: String,
      location: String,

      competitor_1: {
        name: String,
        location: String,
        services: String,
      },

      competitor_2: {
        name: String,
        location: String,
        services: String,
      },

      analysis: {
        competitive_intensity: String,
        differentiation_gap: String,
        entry_barriers: String,
        pricing_pressure: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "RivalryInsight",
  RivalryInsightSchema
);
