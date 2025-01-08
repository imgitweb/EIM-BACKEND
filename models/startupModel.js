const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  startup_name: { type: String, required: true },
  email_id: { type: String, required: true },
  mobile_no: { type: String, required: true },
  country_name: { type: String, required: true },
  industry: { type: String, required: true },
  stage: { type: String, required: true },
  city_name: { type: String, required: true },
  startup_idea: { type: String, required: true },
  usertype: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
