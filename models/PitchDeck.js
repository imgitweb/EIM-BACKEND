const mongoose = require("mongoose");

const PitchDeckSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Agar login system hai to
  formData: Object, // Jo user ne input diya tha
  pitchDeckData: Object, // Jo AI ne generate kiya
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PitchDeck", PitchDeckSchema);