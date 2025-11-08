var mongoose = require("mongoose");

var deliverableSchema = new mongoose.Schema(
  {
    deliverable_name: {
      type: String,
      required: true,
      trim: true,
    },
    startup_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "startupModel",
    },
    is_completed: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    file_location: {
      type: String,
      trim: true,
    },
    remark: {
      type: String,
      trim: true,
    },
    completed_at: {
      type: Date,
      trim: true,
    },
    week: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports.deliverableModel = mongoose.model(
  "deliverableModel",
  deliverableSchema
);
