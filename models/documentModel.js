const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  startup_id: {
    type: String,
    required: true,
    unique: true,
  },
  company_registration: {
    type: String, // URL or path to the uploaded file
    default: null,
  },
  aadhar_card: {
    type: String,
    default: null,
  },
  pan_card: {
    type: String,
    default: null,
  },
  dpiit: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Document", documentSchema);
