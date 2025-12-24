const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    startup_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel", // Ensure ref matches actual model name
      required: true,
      index: true, // Added index for queries
    },

    activity_name: {
      type: String,
      required: true,
    },
    activity_schema: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    }, // Removed duplicate

    week: {
      type: String,
      required: true,
    },

    is_completed: {
      type: Boolean,
      default: false,
    },

    is_accessible: {
      // Fixed spelling: accessable -> accessible
      type: Boolean,
      default: false,
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Additional indexes for performance
activitySchema.index({ startup_id: 1, order: 1 });
activitySchema.index({ startup_id: 1, is_deleted: 1 });

const ActivityModel = mongoose.model("activities", activitySchema); // Pluralized model name for convention

module.exports = { ActivityModel };
