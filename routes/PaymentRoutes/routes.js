const {
  Instance,
  Success,
  confirmRazorPaySubscription,
} = require("../../utils/razorpay/RazorPay");

const route = require("express").Router();

route.post("/instance", Instance);
route.post("/success", Success);
route.post("/confirm", confirmRazorPaySubscription);

module.exports.paymentRouters = route;
