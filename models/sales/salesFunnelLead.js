// models/SalesFunnelLead.js
const mongoose = require("mongoose");

const salesFunnelLeadSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
    interest: {
      type: String,
      required: true,
      enum: ["demo", "pricing", "consultation"],
    },
    budget: {
      type: String,
      required: true,
      enum: ["under-500", "500-1000", "1000-2000"],
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesFunnelLead", salesFunnelLeadSchema);
