var mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    startup_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    activity_name: {
      type: String,
      required: true,
    },
    week: {
      type: String,
      required: true,
    },
    activity_schema: {
      type: String,
    },
    is_completed: {
      type: Boolean,
      default: false,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports.ActivityModel = mongoose.model("activityModel", activitySchema);
