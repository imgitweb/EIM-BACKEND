// coFounderModel.js
const mongoose = require("mongoose");

const coFounderSchema = new mongoose.Schema(
  {
    coFounderName: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    typeOfCoFounder: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    weeklyAvailability: {
      type: String,
      required: true,
    },
    startupStage: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CoFounder", coFounderSchema);
