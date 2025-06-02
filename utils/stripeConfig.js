// server/utils/stripeConfig.js - Stripe Configuration
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent with Stripe
 * @param {number} amount - Amount in smallest currency unit (e.g., cents for USD)
 * @param {string} currency - Currency code (e.g., 'usd')
 * @param {string} description - Description of the payment
 * @param {Object} metadata - Additional metadata for the payment
 * @returns {Promise<Object>} - Payment intent object
 */
const createPaymentIntent = async (
  amount,
  currency = "usd",
  description,
  metadata = {}
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata,
      payment_method_types: ["card"],
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

/**
 * Retrieve a payment intent from Stripe
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} - Payment intent object
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw error;
  }
};

/**
 * Create a customer in Stripe
 * @param {string} email - Customer email
 * @param {string} name - Customer name
 * @param {Object} metadata - Additional customer metadata
 * @returns {Promise<Object>} - Stripe customer object
 */
const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

/**
 * Create a subscription in Stripe
 * @param {string} customerId - Stripe customer ID
 * @param {string} priceId - Stripe price ID
 * @param {Object} metadata - Additional subscription metadata
 * @returns {Promise<Object>} - Stripe subscription object
 */
const createSubscription = async (customerId, priceId, metadata = {}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
    });

    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

/**
 * Cancel a subscription in Stripe
 * @param {string} subscriptionId - Stripe subscription ID
 * @param {boolean} cancelAtPeriodEnd - Whether to cancel at the end of the billing period
 * @returns {Promise<Object>} - Stripe subscription object
 */
const cancelSubscription = async (subscriptionId, cancelAtPeriodEnd = true) => {
  try {
    if (cancelAtPeriodEnd) {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    } else {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  retrievePaymentIntent,
  createCustomer,
  createSubscription,
  cancelSubscription,
};
