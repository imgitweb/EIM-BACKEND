const mongoose = require("mongoose");

const complianceSchema = new mongoose.Schema(
  {
    startupName: {
      type: String,
      required: true,
    },
    registrationType: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
      default: "Not Available",
    },

    panNumber: {
      type: String,
      default: "Not Available",
    },
    submissionDate: {
      type: Date,
      required: true,
    },
    complianceFrequency: {
      type: String,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Compliance", complianceSchema);
