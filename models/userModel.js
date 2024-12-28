const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    startup_name: { type: String, required: true, unique: true },
    email_id: { type: String, required: true, unique: true },
    mobile_no: { type: String, required: true, unique: true },
    country_name: { type: String, required: true },
    industry: { type: String, required: true },
    stage: { type: String, required: true },
    city_name: { type: String, required: true },
    startup_idea: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
