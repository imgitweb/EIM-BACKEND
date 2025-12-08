const mongoose = require("mongoose");

const SchemaModel = new mongoose.Schema({
  startup_id: {
    type: String,
    required: true,
    unique: true,
    ref: "StartupModel",
  },
  milestones: { type: Object, required: true },
});

module.exports = mongoose.model("PathModels", SchemaModel);
