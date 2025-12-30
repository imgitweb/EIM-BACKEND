const mongoose = require("mongoose");

const coFounderSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
      index: true, 
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ New Fields to match Frontend
    country: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    expertise: {
      type: String,
      required: true,
      trim: true,
    },

    linkedInProfile: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    equity: {
      type: Number, // Percentage
      min: 0,
      max: 100,
    },

    profilePicture: {
      type: String, 
    },
    
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoFounder", coFounderSchema);