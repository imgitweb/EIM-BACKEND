const mongoose = require("mongoose");

const StartupHireTeamSchema = new mongoose.Schema(
  {
    startupName: { type: String, required: true },
    website: { type: String },
    linkedin: { type: String },
    country: { type: String },
    stage: { type: String },
    sector: { type: String },

    recruiterName: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },

    jobTitle: { type: String, required: true },
    jobDescription: { type: String, required: true },
    jobType: { type: String, required: true },
    workLocation: { type: String, required: true },
    skills: { type: String, required: true },
    experience: { type: String, required: true },
    education: { type: String, required: true }, 

    salaryMin: { type: Number, required: true },
    salaryMax: { type: Number, required: true },
    currency: { type: String, required: true },

    applicationDeadline: { type: Date, required: true },

    additionalNotes: { type: String, default: null },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StartupHireTeam", StartupHireTeamSchema);
