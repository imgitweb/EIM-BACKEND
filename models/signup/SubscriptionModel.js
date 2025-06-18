const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StartupModel",
    required: true,
  },
  planId: {
    type: String,
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "canceled"],
    default: "active",
  },
});
module.exports = mongoose.model("SubscriptionModel", subscriptionSchema);
