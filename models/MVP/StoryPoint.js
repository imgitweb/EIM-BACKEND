// models/StoryPoint.js
const mongoose = require("mongoose");

const StoryPointSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MvpSession",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Must-Have", "Should-Have", "Could-Have"],
      default: "Must-Have",
    },

    isSelected: {
      type: Boolean,
      default: false,
    },

    source: {
      type: String,
      enum: ["ai", "custom"],
      default: "ai",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoryPoint", StoryPointSchema);
