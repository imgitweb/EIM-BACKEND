const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    selected_products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StartupOffering', // Aapke Offering model ka naam
      required: true
    }],
    customer_profile_name: { type: String, required: true },
    customer_profile_minimum_age: { type: Number, required: true },
    customer_profile_maximum_age: { type: Number, required: true },
    customer_gender: { type: String, default: "Any" },
    continent: [{ type: String }],
    country: [{ type: String }],
    target_area_types: [{ type: String }],
    profession: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerProfile", profileSchema);
