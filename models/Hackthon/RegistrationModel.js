const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  name: String,
  identifier: String, // institute / org / linkedin
  email: String,
  phone: String,
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

      category: String, // institution | organization | freelancer
      instituteOrOrg: String, // college / company / N/A
      uniqueId: String, // rollNo / gstNo / linkedin

      // --- NEW FIELDS ADDED HERE ---
      aboutStartup: { type: String, required: true }, // Mandatory
      pitchFile: String, // Optional (Stores Base64 string of the file)
    },

    teamConfig: {
      size: Number,
      track: String,
    },

    members: [MemberSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamRegistration", TeamRegistrationSchema);
