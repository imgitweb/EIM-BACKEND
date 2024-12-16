const mongoose = require("mongoose");

const StartupSchema = new mongoose.Schema({
  startup_name: { type: String, required: true },
  email_id: { type: String, required: true, unique: true },
  mobile_no: { type: String, required: true },
  country: { type: String, required: true },
  industry: { type: String, required: true },
  startup_stage: { type: String, required: true },
  city_name: { type: String, required: true },
  startup_idea: { type: String, required: true },
  password: { type: String, required: true }, // This is marked as required
});

module.exports = mongoose.model("Startup", StartupSchema);
