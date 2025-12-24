const mongoose = require("mongoose");

// Leader Schema
const LeaderSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
  },
  category: {
    type: String,
  },
  instituteOrOrg: {
    type: String,
  },
  uniqueId: {
    type: String,
  },
});

// Team Configuration Schema
const TeamConfigSchema = new mongoose.Schema({
  size: {
    type: Number,
    required: true,
  },
  track: {
    type: String,
    required: true,
  },
});

// Team Member Schema
const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  identifier: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
});

// Main Registration Schema
const RegistrationSchema = new mongoose.Schema({
  leader: {
    type: LeaderSchema,
    required: true,
  },
  teamConfig: {
    type: TeamConfigSchema,
    required: true,
  },
  members: {
    type: [MemberSchema],
    default: [],
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

// Export Model
module.exports = mongoose.model("HackRegistration", RegistrationSchema);
