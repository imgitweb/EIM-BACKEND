// models/MvpScope.js
const mongoose = require("mongoose");

const MvpScopeSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MvpSession",
      required: true,
    },

    // 🔥 Full structured scope JSON
    scopeData: {
      type: mongoose.Schema.Types.Mixed, // JSON object
      required: true,
    },

    // 🔹 Derived / indexed fields (optional but powerful)
    totalEstimatedDurationWeeks: {
      type: Number,
    },

    techStack: {
      frontend: [String],
      backend: [String],
      database: [String],
      hosting: [String],
      others: [String],
    },

    teamRequired: {
      type: [String], // ["Frontend", "Backend", "AI"]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MvpScope", MvpScopeSchema);
