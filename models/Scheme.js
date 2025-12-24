const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    shortName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
      default: null,
      validate: {
        validator: function (v) {
          if (v === null || v === undefined) return true;
          try {
            new URL(v);
            return true;
          } catch (err) {
            return false;
          }
        },
        message: "Image must be a valid URL",
      },
    },
    detailedBenefits: {
      type: [String],
      default: [],
    },
    detailedEligibility: {
      type: [String],
      default: [],
    },
    applicationProcess: {
      type: [String],
      default: [],
    },
    documentsRequired: {
      type: [String],
      default: [],
    },
    applyUrl: {
      type: String,
      required: false,
      default: "https://www.startupindia.gov.in/",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Scheme", schemeSchema);
