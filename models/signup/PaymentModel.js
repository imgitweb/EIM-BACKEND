const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupModel",
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionModel",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be greater than or equal to 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      default: "USD",
      uppercase: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      default: "card",
      trim: true,
    },
    status: {
      type: String,
      enum: ["succeeded", "failed", "pending", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: function () {
        return this.amount > 0;
      },
    },
    refundId: {
      type: String,
    },
    refundReason: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Method to process refund
paymentSchema.methods.refund = async function (reason) {
  this.status = "refunded";
  this.refundReason = reason;
  this.refundedAt = new Date();
  return this.save();
};

// Indexes
paymentSchema.index({ startupId: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model("PaymentModel", paymentSchema);
