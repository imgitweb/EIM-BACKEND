const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // Links lead to a specific user
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    source: { type: String, default: "Direct" }, // e.g. Instagram, LinkedIn
    status: {
      type: String,
      enum: ["New", "Contacted", "Converted", "Lost"],
      default: "New",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeadTracker", LeadSchema);
