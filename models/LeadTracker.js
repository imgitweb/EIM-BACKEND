const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // Links lead to a specific user
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },

    // Updated default to match your frontend
    source: { type: String, default: "Website" },

    // Updated Enum to match your new frontend Dropdown options exactly
    status: {
      type: String,
      enum: [
        "New Lead",
        "Contacted",
        "Qualified",
        "In Discussion",
        "Proposal Shared",
        "Negotiation",
        "Converted",
        "Lost / Not Interested",
      ],
      default: "New Lead",
    },

    // --- NEW FIELDS ---
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeadTracker", LeadSchema);
