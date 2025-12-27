const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
});

const RegistrationSchema = new mongoose.Schema({
  leader: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    category: String,
    instituteOrOrg: String,
    uniqueId: String,
  },
  teamConfig: {
    size: Number,
    track: String,
  },
  members: [MemberSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("HackRegistration", RegistrationSchema);
