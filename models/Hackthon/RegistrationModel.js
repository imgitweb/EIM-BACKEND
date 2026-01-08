const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  name: String,
  identifier: String,
  email: String,
  phone: String,
  gender: String,
  photo: String, // <--- ADDED: To store member photo path
});

const TeamRegistrationSchema = new mongoose.Schema(
  {
    leader: {
      firstName: String,
      lastName: String,
      email: { type: String, required: true },
      phone: { type: String, required: true },
      gender: String,
      state: String,
      city: String,
      category: String,
      instituteOrOrg: String,
      uniqueId: String,
      aboutStartup: { type: String, required: true },
      pitchFile: String,
      photo: String, // <--- ADDED: To store leader photo path
    },
    teamConfig: {
      size: Number,
      track: String,
    },
    members: [MemberSchema],
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Verified", "Rejected"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamRegistration", TeamRegistrationSchema);
