const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const StartupModel = require("../../models/signup/StartupModel");
const SubscriptionModel = require("../../models/signup/SubscriptionModel");
const PaymentModel = require("../../models/signup/PaymentModel");
const StartupModel = require("../../models/signup/StartupModel");

// Load plans with error handling
const getPlans = () => {
  try {
    const plansPath = path.join(__dirname, "../../config/Plans.json");
    if (!fs.existsSync(plansPath)) {
      throw new Error("Plans configuration file not found");
    }
    const plansData = JSON.parse(fs.readFileSync(plansPath, "utf8"));
    return plansData.plans;
  } catch (error) {
    console.error("Failed to load plans:", error);
    return [];
  }
};

// Create Subscription
exports.createSubscription = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const plans = getPlans();
    const { startupId, planId, paymentIntentId } = req.body;

    // Validate inputs
    if (!startupId || !planId) {
      return res.status(400).json({
        success: false,
        error: "Startup ID and plan ID are required",
      });
    }

    // Find plan
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan selected",
      });
    }

    // Find startup
    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        error: "Startup not found",
      });
    }

    /* ===============================
       ✅ FIX: FREE PLAN DETECTION
    =============================== */
    const isFree =
      plan.price === 0 ||
      (typeof plan.price === "string" && plan.price.toLowerCase() === "free");

    const planAmount = typeof plan.price === "number" ? plan.price : 0;

    /* ===============================
       PAYMENT VERIFICATION
    =============================== */
    let paymentVerified = isFree;

    if (!isFree) {
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: "Payment information required for paid plans",
        });
      }

      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        const successfulStatuses = [
          "succeeded",
          "processing",
          "requires_capture",
          "requires_payment_method",
        ];

        if (!successfulStatuses.includes(paymentIntent.status)) {
          return res.status(402).json({
            success: false,
            error: `Payment status: ${paymentIntent.status}`,
          });
        }

        const expectedAmount = planAmount * 100;

        if (paymentIntent.amount !== expectedAmount) {
          return res.status(400).json({
            success: false,
            error: "Payment amount mismatch",
          });
        }

        if (
          paymentIntent.metadata.startupId !== startupId ||
          paymentIntent.metadata.planId !== planId
        ) {
          return res.status(400).json({
            success: false,
            error: "Invalid payment metadata",
          });
        }

        paymentVerified = true;
      } catch (err) {
        return res.status(402).json({
          success: false,
          error: "Payment verification failed",
        });
      }
    }

    /* ===============================
       DURATION
    =============================== */
    let durationDays = 30;
    if (typeof plan.duration === "string") {
      if (plan.duration.toLowerCase().includes("90")) durationDays = 90;
    }

    /* ===============================
       CHECK ACTIVE SUBSCRIPTION
    =============================== */
    const existingSubscription = await SubscriptionModel.findOne({
      userId: startup._id,
      status: "active",
    });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        error: "Active subscription already exists",
      });
    }

    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
    );

    /* ===============================
       CREATE SUBSCRIPTION
    =============================== */
    const subscription = await SubscriptionModel.create({
      userId: startup._id,
      planId,
      stripeSubscriptionId: paymentIntentId || null,
      startDate,
      endDate,
      status: "active",
    });

    /* ===============================
       CREATE PAYMENT RECORD
    =============================== */
    const payment = await PaymentModel.create({
      startupId,
      subscriptionId: subscription._id,
      amount: isFree ? 0 : planAmount,
      currency: "usd",
      status: paymentVerified ? "succeeded" : "pending",
      stripePaymentIntentId: paymentIntentId || null,
      date: new Date(),
    });

    startup.selectedPlan = planId;
    await startup.save();

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription,
      payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Failed to create subscription",
    });
  }
};

// Get Subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const { startupId } = req.params;

    console.log("Get Subscriptions Request:", { startupId });

    if (!startupId) {
      return res.status(400).json({
        success: false,
        error: "Startup ID is required",
      });
    }

    const startup = await StartupModel.findById(startupId);
    // console.log("Startup Found:", startup);
    if (!startup) {
      return res.status(404).json({
        success: false,
        error: "Startup not found",
      });
    }

    const subscriptions = await SubscriptionModel.find({
      userId: startupId,
    }).populate("userId", "-password");

    res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("Get Subscriptions Error:----------------------", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subscriptions",
    });
  }
};

// Cancel Subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Subscription ID is required",
      });
    }

    const subscription = await SubscriptionModel.findById(id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    const startup = await StartupModel.findById(subscription.userId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        error: "Associated startup not found",
      });
    }

    // Authorization check
    if (
      req.user &&
      req.user.id !== subscription.userId.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to cancel this subscription",
      });
    }

    // Cancel Stripe subscription if it exists
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.paymentIntents.cancel(subscription.stripeSubscriptionId);
      } catch (stripeError) {
        console.error("Stripe cancellation error:", stripeError);
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Cancel subscription locally
    await subscription.cancel();

    // Reset startup plan to default
    startup.selectedPlan = "alpha";
    await startup.save();

    res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
      subscription: {
        id: subscription._id,
        status: subscription.status,
        canceledAt: subscription.canceledAt,
      },
    });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel subscription",
    });
  }
};

// Get Subscription Status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { startupId } = req.params;

    if (!startupId) {
      return res.status(400).json({
        success: false,
        error: "Startup ID is required",
      });
    }

    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        error: "Startup not found",
      });
    }

    const activeSubscription = await SubscriptionModel.findOne({
      userId: startupId,
      status: "active",
    });

    const plans = getPlans();
    const currentPlan =
      plans.find((p) => p.id === startup.selectedPlan) || plans[0];

    res.status(200).json({
      success: true,
      subscription: activeSubscription,
      currentPlan: currentPlan,
      hasActiveSubscription: !!activeSubscription,
    });
  } catch (error) {
    console.error("Get Subscription Status Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get subscription status",
    });
  }
};
