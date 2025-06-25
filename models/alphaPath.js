const mongoose = require("mongoose");

const AlphaPath = new mongoose.Schema({
  startup_id: { type: String, required: true, unique: true },
  milestones: { type: Object, required: true },
});

module.exports = mongoose.model("pathModel", AlphaPath);
