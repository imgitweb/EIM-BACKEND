const mongoose = require("mongoose");

const shaktiSangamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    occupation: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ShaktiSangam = mongoose.model("ShaktiSangam", shaktiSangamSchema);

module.exports = ShaktiSangam;
