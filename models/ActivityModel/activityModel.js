const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    startup_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
      index: true,
    },

    activity_name: { type: String, required: true },
    activity_schema: { type: String, required: true },

    order: { type: Number, required: true },

    prerequisite: [
      {
        activity_schema: { type: String, required: true },
        status: { type: Boolean, default: false },
      },
    ],

    is_completed: { type: Boolean, default: false },
    is_accessible: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

activitySchema.index({ startup_id: 1, order: 1 });
activitySchema.index({ startup_id: 1, activity_schema: 1 }, { unique: true });

module.exports = {
  ActivityModel: mongoose.model("activities", activitySchema),
};
