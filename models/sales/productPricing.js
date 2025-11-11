// models/ProductPricing.js
const mongoose = require("mongoose");

const productPricingSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
    purpose: {
      type: String,
      required: true,
      enum: [
        "Subscribe to Newsletter",
        "Request a Demo",
        "General Inquiry",
        "Social Media",
      ],
    },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductPricing", productPricingSchema);
