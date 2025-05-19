const { validationResult } = require("express-validator");
const Stripe = require("stripe");
const fs = require("fs");
const path = require("path");
const StartupModel = require("../../models/signup/StartupModel");

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
    if (!plansData.plans || !Array.isArray(plansData.plans)) {
      throw new Error("Invalid plans configuration");
    }
    // Validate each plan
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
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const stripe = getStripeInstance();
    const plans = getPlans();

    const { email, planId } = req.body;

    if (!email || !planId) {
      return res.status(400).json({ error: "Email and plan ID are required" });
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400.0).json({ error: "Invalid plan" });
    }

    console.log("Selected Plan:", plan);

    // Handle free plan case
    const amount =
      plan.price === "Free" || plan.price === 0 || plan.price === "0"
        ? 0
        : typeof plan.price === "number"
        ? plan.price * 100
        : null;

    console.log("Calculated Amount:", amount);

    if (amount === null) {
      return res.status(400).json({ error: "Invalid plan price format" });
    }

    if (amount === 0) {
      return res
        .status(200)
        .json({ clientSecret: null, message: "Free plan selected" });
    }

    // Find startup and create/update Stripe customer
    let startup = await StartupModel.findOne({ email });
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }

    // Create or retrieve Stripe customer
    if (!startup.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name: `${startup.firstName} ${startup.lastName}`,
      });
      startup.stripeCustomerId = customer.id;
      await startup.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: startup.stripeCustomerId,
      metadata: {
        planId,
        startupId: startup._id.toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(500).json({ error: error.message || "Payment service error" });
  }
};
