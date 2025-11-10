var crypto = require("crypto");
const Razorpay = require("razorpay");
const {
  SubscriptionModel,
} = require("../../models/Subscription/SubscriptionSchema");

require("dotenv").config();

const Initiate = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET_KEY,
});

module.exports.Instance = async (req, res) => {
  try {
    const { amount } = req.body;
    const currency = req.body.currency || "INR";
    const option = {
      amount: amount * 100,
      currency: currency || "INR",
    };

    const order = await Initiate.orders.create(option);
    return res.status(200).json({
      message: "Order generated successfully",
      success: true,
      order: order,
    });
  } catch (error) {
    console.error(
      "❌ something went wrong while creating instance for Razorpay"
    );
    return res.status(500).json({
      message: "Internal sever error",
      success: false,
    });
  }
};

module.exports.Success = async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    console.log(req.body);

    const hmac = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET_KEY);
    hmac.update(orderCreationId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");

    console.log("🟰🟰🟰", { generatedSignature, razorpaySignature });

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature for Razorpay payment",
      });
    }

    res.status(200).json({
      success: true,
      message: "Razorpay payment verified successfully",
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    console.error("❌ Razorpay success verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while verifying Razorpay payment",
    });
  }
};

module.exports.confirmRazorPaySubscription = async (req, res) => {
  try {
    const {
      startup_id,
      payment_id,
      order_id,
      signature,
      plan_name,
      amount,
      currency,
    } = req.body;

    console.log(req.body);

    const hex = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET_KEY);
    hex.update(`${order_id}|${payment_id}`);
    const generatedSignature = hex.digest("hex");
    console.log({ generatedSignature, signature });
    if (generatedSignature !== signature) {
      console.error("❌ couldn't confirm subscription");
      return res.status(403).json({
        message: "Invalid Razorpay signature for subscription confirmation",
        success: false,
      });
    }

    const now = new Date();

    const subscription = await SubscriptionModel.findOne({ startup_id }).sort({
      createdAt: -1,
    });

    let previousSubscription = null;
    let updatedSubscription = null;

    if (subscription) {
      previousSubscription = { ...subscription._doc };

      subscription.subscription_status = "expired";
      await subscription.save();

      const newSubscription = new SubscriptionModel({
        startup_id,
        payment_id,
        order_id,
        subscription_name: plan_name,
        subscription_amount: amount,
        subscription_status: "active",
        duration: new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          now.getDate()
        ),
        start_date: now,
        end_date: new Date(now.setMonth(now.getMonth() + 1)),
      });

      updatedSubscription = await newSubscription.save();
    } else {
      const newSubscription = new SubscriptionModel({
        startup_id,
        payment_id,
        order_id,
        subscription_name: plan_name,
        subscription_amount: amount,
        subscription_status: "active",
        duration: new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          now.getDate()
        ),
        start_date: now,
        end_date: new Date(now.setMonth(now.getMonth() + 1)),
      });

      updatedSubscription = await newSubscription.save();
    }

    return res.status(200).json({
      message: "Subscription payment confirmed successfully",
      success: true,
      current_subscription: updatedSubscription,
      previous_subscription: previousSubscription,
    });
  } catch (error) {
    console.error(
      "❌ Something went wrong while confirming the subscription",
      error
    );
    return res.status(500).json({
      message: "Something went wrong while confirming the payment",
      success: false,
    });
  }
};
