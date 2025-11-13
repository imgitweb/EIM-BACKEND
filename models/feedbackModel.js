const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    startup_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    category: {
      type: String,
      enum: ["Bug Report", "Feature Request", "General Feedback"],
      default: "General Feedback",
    },
    comment: {
      type: String,
      required: [true, "Please enter a feedback comment"],
      trim: true,
    },
    user: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved"],
      default: "New",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
