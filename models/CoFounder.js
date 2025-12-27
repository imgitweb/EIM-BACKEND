// coFounderModel.js
const mongoose = require("mongoose");

const coFounderSchema = new mongoose.Schema(
  {
    startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    expertise: { type: String, required: true },
    linkedInProfile: { type: String  },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CoFounder", coFounderSchema);
