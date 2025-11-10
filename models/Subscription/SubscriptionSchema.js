const { default: mongoose } = require("mongoose");

const SubscriptionModel = new mongoose.Schema(
  {
    startup_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "StartupModel",
    },
    subscription_status: {
      type: String,
      required: true,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
    subscription_name: {
      type: String,
      required: true,
      trim: true,
      default: "Free",
    },
    payment_id: {
      type: String,
      required: true,
      trim: true,
    },
    subscription_amount: {
      type: String,
      required: true,
    },
    order_id: {
      type: String,
      default: null,
    },
    duration: {
      type: Date,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports.SubscriptionModel = mongoose.model(
  "subscription_model",
  SubscriptionModel
);
