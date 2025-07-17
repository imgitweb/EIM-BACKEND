const mongoose = require("mongoose");

const FunnelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
});

module.exports = mongoose.model("Funnel", FunnelSchema);
