const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true },
    company_type: { type: String, required: true },
    reg_number: { type: String, required: true, unique: true },
    founding_date: { type: String, required: true },
    startup_id: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("incorporation", companySchema);
