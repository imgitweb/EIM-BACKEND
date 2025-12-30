const mongoose = require("mongoose");

// 1. Updated Member Schema to include Gender
const MemberSchema = new mongoose.Schema({
  name: String,
  identifier: String, // institute / org / linkedin
  email: String,
  phone: String,
  gender: String, // <--- ADDED: To capture member gender from frontend
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

      aboutStartup: { type: String, required: true },
      pitchFile: String, // Stores Base64 string or file path
    },

    teamConfig: {
      size: Number,
      track: String,
    },

    members: [MemberSchema],

    // 2. Updated Main Schema to include Status (for Admin Dashboard)
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Verified", "Rejected"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamRegistration", TeamRegistrationSchema);
