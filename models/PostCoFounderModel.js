// models/PostCoFounder.js
const mongoose = require("mongoose");

const postCoFounderSchema = new mongoose.Schema({
  startupName: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  linkedin: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  stage: {
    type: String,
    required: true,
  },
  sector: {
    type: String,
    required: true,
  },
  elevatorPitch: {
    type: String,
    required: true,
  },
  problemStatement: {
    type: String,
    required: true,
  },
  founder1Name: {
    type: String,
    required: true,
  },
  founder1LinkedIn: {
    type: String,
    required: true,
  },
  founder2Name: {
    type: String,
    default: "",
  },
  founder2LinkedIn: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("PostCoFounder", postCoFounderSchema);
