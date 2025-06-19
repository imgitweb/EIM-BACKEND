const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const StartupModel = require("../../models/signup/StartupModel");
const SubscriptionModel = require("../../models/signup/SubscriptionModel");
const PaymentModel = require("../../models/signup/PaymentModel");

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

    // Debug: Log request payload
    console.log("Create Subscription Request:", {
      startupId,
      planId,
      paymentIntentId,
    });

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

    // Find and validate startup
    const startup = await StartupModel.findById(startupId);
    if (!startup) {
      return res.status(404).json({
        success: false,
        error: "Startup not found",
      });
    }

    // Check if email verification is required for paid plans
    const isFree = plan.price === "free" || plan.price === 0;
    // if (!isFree && !startup.emailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     error: "Email verification required before subscribing to paid plans",
    //   });
    // }

    // Verify payment for paid plans
    let paymentVerified = isFree; // Free plans don't need payment verification
    if (!isFree) {
      if (!paymentIntentId) {
        return res.status(400).json({
          success: false,
          error: "Payment information required for paid plans",
        });
      }

      try {
        console.log("Verifying payment intent:", paymentIntentId);

        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        console.log("Payment Intent Details:", {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata,
        });

        // Accept multiple successful statuses
        const successfulStatuses = [
          "succeeded",
          "processing",
          "requires_capture",
          "requires_payment_method",
        ];

        if (!successfulStatuses.includes(paymentIntent.status)) {
          console.log(
            "Payment verification failed - status:",
            paymentIntent.status
          );
          return res.status(402).json({
            success: false,
            error: `Payment status: ${paymentIntent.status}. Please try again.`,
          });
        }

        // Verify payment amount matches plan price
        const expectedAmount =
          typeof plan.price === "number" ? plan.price * 100 : 0;
        console.log("Amount verification:", {
          paymentAmount: paymentIntent.amount,
          expectedAmount: expectedAmount,
          planPrice: plan.price,
        });

        if (paymentIntent.amount !== expectedAmount) {
          return res.status(400).json({
            success: false,
            error: `Payment amount mismatch: expected ${expectedAmount}, got ${paymentIntent.amount}`,
          });
        }

        // Verify metadata matches request
        console.log("Metadata verification:", {
          paymentMetadata: paymentIntent.metadata,
          requestData: { startupId, planId },
        });

        if (
          paymentIntent.metadata.startupId !== startupId ||
          paymentIntent.metadata.planId !== planId
        ) {
          return res.status(400).json({
            success: false,
            error: "Payment verification failed. Invalid metadata.",
          });
        }

        console.log("Payment verification successful!");
        paymentVerified = true;
      } catch (stripeError) {
        console.error("Stripe verification error:", stripeError);
        return res.status(402).json({
          success: false,
          error: "Payment verification failed. Please contact support.",
        });
      }
    }

    // Calculate subscription duration
    let durationDays;
    switch (plan.duration) {
      case "30 days":
        durationDays = 30;
        break;
      case "90 days":
        durationDays = 90;
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
      return res.status(400).json({
        success: false,
        error: "Invalid subscription duration",
      });
    }

    // Check for existing active subscription
    const existingSubscription = await SubscriptionModel.findOne({
      userId: startup._id,
      status: "active",
    });

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        error: "An active subscription already exists for this startup",
      });
    }
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + durationDays * 24 * 60 * 60 * 1000
    );
    // Create subscription data
    const subscriptionData = {
      userId: startup._id,
      planId,
      stripeSubscriptionId: paymentIntentId || null,
      startDate: startDate,
      status: "active",
      endDate: endDate,
    };

    // Create and save subscription
    const subscription = new SubscriptionModel(subscriptionData);
    await subscription.save();

    // Create payment record
    const paymentData = {
      startupId,
      subscriptionId: subscription._id,
      amount: isFree ? 0 : typeof plan.price === "number" ? plan.price : 0,
      currency: "usd",
      status: paymentVerified ? "succeeded" : "pending",
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
      subscription: {
        id: subscription._id,
        planId: subscription.planId,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        date: payment.date,
      },
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "A subscription with this information already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create subscription. Please try again later.",
    });
  }
};

// Get Subscriptions
exports.getSubscriptions = async (req, res) => {
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

    const subscriptions = await SubscriptionModel.find({
      userId: startupId,
    }).populate("userId", "-password");

    res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("Get Subscriptions Error:", error);
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
