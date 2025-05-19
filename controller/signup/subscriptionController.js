const { validationResult } = require("express-validator");
const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
const StartupModel = require("../../models/signup/StartupModel");
const SubscriptionModel = require("../../models/signup/SubscriptionModel");
const PaymentModel = require("../../models/signup/PaymentModel");

// Initialize Stripe with proper error handling
const getStripeInstance = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("Missing Stripe secret key");
    throw new Error("Stripe configuration error");
  }
  return new Stripe(stripeKey);
};

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

exports.createSubscription = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const stripe = getStripeInstance();
    const plans = getPlans();

    const { startupId, planId, paymentIntentId } = req.body;

    // Debug: Log request payload
    console.log("Create Subscription Request:", {
      startupId,
      planId,
      paymentIntentId,
    });

    // Validate inputs
    if (!startupId || !planId) {
      return res
        .status(400)
        .json({ error: "Startup ID and plan ID are required" });
    }

    // Find plan
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Find and validate startup
    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }

    // For paid plans, verify that startup is verified
    if (plan.price !== "Free" && !startup.isVerified) {
      return res
        .status(403)
        .json({ error: "Email verification required before subscription" });
    }

    // Calculate subscription duration
    let durationDays;
    switch (plan.duration) {
      case "30 days":
        durationDays = 30;
        break;
      case "1 year":
        durationDays = 365;
        break;
      case "2 years":
        durationDays = 730;
        break;
      default:
        durationDays = 30; // Fallback
        console.warn(
          `Unknown plan duration: ${plan.duration}, defaulting to 30 days`
        );
    }

    // Validate durationDays
    if (!durationDays || isNaN(durationDays) || durationDays <= 0) {
      console.error("Invalid durationDays:", durationDays);
      return res.status(400).json({ error: "Invalid subscription duration" });
    }

    // Create subscription data
    const subscriptionData = {
      userId: startup._id, // Map startupId to userId
      planId,
      stripeSubscriptionId: paymentIntentId || null,
      startDate: new Date(),
      status: "active",
    };

    // For paid plans, verify payment
    if (plan.price !== "Free" && paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );
        if (paymentIntent.status !== "succeeded") {
          return res.status(400).json({
            error: "Payment not successful",
            paymentStatus: paymentIntent.status,
          });
        }
        // Verify payment metadata
        if (
          paymentIntent.metadata.startupId !== startupId ||
          paymentIntent.metadata.planId !== planId
        ) {
          return res.status(400).json({ error: "Payment details mismatch" });
        }
      } catch (stripeError) {
        console.error("Stripe Payment Verification Error:", stripeError);
        return res.status(400).json({ error: "Payment verification failed" });
      }
    } else if (plan.price !== "Free" && !paymentIntentId) {
      return res
        .status(400)
        .json({ error: "Payment information required for paid plans" });
    }

    // Create and save subscription
    const subscription = new SubscriptionModel(subscriptionData);
    try {
      await subscription.extend(durationDays);
    } catch (extendError) {
      console.error("Extend Method Error:", extendError);
      return res
        .status(400)
        .json({ error: "Failed to calculate subscription end date" });
    }
    await subscription.save();

    // Create payment record
    const paymentData = {
      startupId,
      subscriptionId: subscription._id,
      amount:
        plan.price === "Free"
          ? 0
          : typeof plan.price === "number"
          ? plan.price
          : 0,
      currency: "usd",
      status: "succeeded",
      stripePaymentIntentId: paymentIntentId || null,
      date: new Date(),
    };

    const payment = new PaymentModel(paymentData);
    await payment.save();

    // Update startup's selected plan
    startup.selectedPlan = planId;
    await startup.save();

    // Debug: Log created subscription
    console.log("Created Subscription:", subscription);

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription,
      payment,
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create subscription" });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const { startupId } = req.params;

    if (!startupId) {
      return res.status(400).json({ error: "Startup ID is required" });
    }

    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }

    const subscriptions = await SubscriptionModel.find({
      userId: startupId, // Updated to userId
    }).populate("userId", "-password");

    res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("Get Subscriptions Error:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const stripe = getStripeInstance();
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }

    const subscription = await SubscriptionModel.findById(id);
    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const startup = await StartupModel.findById(subscription.userId); // Updated to userId
    if (!startup) {
      return res.status(404).json({ error: "Associated startup not found" });
    }

    if (
      req.user &&
      req.user.id !== subscription.userId.toString() &&
      !req.user.isAdmin
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to cancel this subscription" });
    }

    await subscription.cancel();

    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.paymentIntents.cancel(subscription.stripeSubscriptionId);
      } catch (stripeError) {
        console.error("Stripe Cancellation Error:", stripeError);
      }
    }

    startup.selectedPlan = "alpha";
    await startup.save();

    res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
      subscription,
    });
  } catch (error) {
    console.error("Cancel Subscription Error:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
};
