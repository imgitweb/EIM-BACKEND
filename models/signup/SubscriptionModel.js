const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Startup",
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

// Extend method to calculate endDate
subscriptionSchema.methods.extend = function (durationDays) {
  if (!durationDays || isNaN(durationDays) || durationDays <= 0) {
    throw new Error(`Invalid duration: ${durationDays}`);
  }
  const start = this.startDate || new Date();
  if (!(start instanceof Date) || isNaN(start)) {
    throw new Error("Invalid startDate");
  }
  this.endDate = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
  return this;
};

// Cancel method
subscriptionSchema.methods.cancel = async function () {
  this.status = "canceled";
  this.endDate = new Date(); // Set endDate to now
  await this.save();
  return this;
};

module.exports = mongoose.model("SubscriptionModel", subscriptionSchema);
