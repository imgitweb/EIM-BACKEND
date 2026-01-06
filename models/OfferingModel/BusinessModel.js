const mongoose = require("mongoose");

const BusinessModelSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    // --- NEW FIELDS TO LINK DATA ---
    serviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StartupOffering", // Assuming your offering model is named 'Offering'
      },
    ],
    profileIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomerProfile", // Assuming your profile model is named 'CustomerProfile'
      },
    ],

    businessName: { type: String, required: true },
    businessType: { type: String },

    // The AI Generated Canvas Data
    generatedCanvas: {
      Problem: String,
      Solution: String,
      "Unique Value Proposition": String,
      "Customer Segments": String,
      "Key Metrics": String,
      Channels: String,
      "Cost Structure": String,
      "Revenue Streams": String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessModel", BusinessModelSchema);
