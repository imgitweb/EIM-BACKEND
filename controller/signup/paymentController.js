const { validationResult } = require("express-validator");
const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
const StartupModel = require("../../models/signup/StartupModel");
const getStripeInstance = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("Missing Stripe secret key");
    throw new Error("Stripe configuration error");
  }
  return new Stripe(stripeKey);
};
const getPlans = () => {
  try {
    const plansPath = path.join(__dirname, "../../config/Plans.json");
    if (!fs.existsSync(plansPath)) {
      throw new Error("Plans configuration file not found");
    }
    const plansData = JSON.parse(fs.readFileSync(plansPath, "utf8"));
    if (!plansData.plans || !Array.isArray(plansData.plans)) {
      throw new Error("Invalid plans configuration");
    }
    plansData.plans.forEach((plan) => {
      if (!plan.id || !plan.name || plan.price === undefined) {
        throw new Error(`Invalid plan: ${JSON.stringify(plan)}`);
      }
    });
    return plansData.plans;
  } catch (error) {
    console.error("Failed to load plans:", error);
    return [];
  }
};

exports.createPaymentIntent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const stripe = getStripeInstance();
    const plans = getPlans();

    const { email, planId } = req.body;

    console.log("Payment Intent Request:", { email, planId });

    if (!email || !planId) {
      return res.status(400).json({
        success: false,
        error: "Email and plan ID are required",
      });
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: "Invalid plan",
      });
    }

    console.log("Selected Plan:", plan);
    let amount = 0;
    const price =
      typeof plan.price === "string"
        ? plan.price.trim().toLowerCase()
        : plan.price;

    if (price !== "free" && price !== "0" && price !== 0) {
      const parsed = parseInt(price);
      if (isNaN(parsed)) {
        return res.status(400).json({
          success: false,
          error: "Invalid plan price format",
        });
      }
      amount = parsed * 100;
    }

    console.log("Calculated Amount:", amount);

    if (amount === "free" || amount === 0) {
      return res.status(200).json({
        success: true,
        isFree: true,
        clientSecret: null,
        message: "Free plan selected",
      });
    }

    let startup = await StartupModel.findOne({ email });
    if (!startup) {
      return res.status(404).json({
        success: false,
        error: "Startup not found",
      });
    }
    if (!startup.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name: `${startup.firstName} ${startup.lastName}`,
      });
      startup.stripeCustomerId = customer.id;
      await startup.save();
    }

    console.log("Creating payment intent with amount:", amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: "inr",
      customer: startup.stripeCustomerId,
      metadata: {
        planId,
        startupId: startup._id.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    console.log("Payment intent created:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      message: "Payment intent created successfully",
    });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Payment service error",
    });
  }
};
