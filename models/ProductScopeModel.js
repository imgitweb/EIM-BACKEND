const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  startup_id: { type: mongoose.Schema.Types.ObjectId, ref: "StartupModel", 
  },
  description: { type: String, required: true },
  priority: { type: String, enum: ["Must-Have", "Should-Have", "Could-Have"], required: true },
  tasks: { type: [String], default: [] },
  techStack: { type: [String], default: [] },
  effort: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  notes: { type: String, default: "" }
});

module.exports = mongoose.model("Feature", featureSchema);