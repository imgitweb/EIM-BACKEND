const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  startup_id: { type: String, required: true, unique: true },
  industry: { type: String, required: true },
  businessModel: { type: String, required: true },
  tam: { type: String, required: true },
  som: { type: String, required: true },
  startDate: { type: Date, required: true },
  revenue: { type: String },
  customers: { type: String, required: true },
  pitch: { type: String, required: true },
  problem: { type: String, required: true },
  solution: { type: String, required: true },
  founder1: { type: String, required: true },
  founder2: { type: String },
  country: { type: String, required: true },
  revenueStatus: { type: String, required: true },
  milestones: { type: Object, required: true }, // Storing all milestones in a single object
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Milestone", milestoneSchema);
