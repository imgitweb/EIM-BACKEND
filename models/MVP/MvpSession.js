// models/MvpSession.js
const mongoose = require("mongoose");

const MvpSessionSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },

    productType: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "story_points_generated", "scope_generated", "completed"],
      default: "draft",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MvpSession", MvpSessionSchema);
