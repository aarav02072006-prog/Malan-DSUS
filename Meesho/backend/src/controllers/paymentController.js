const razorpay = require("../config/razorpay.js");
const Order = require("../models/Order.js");
const Cart = require("../models/Carts.js");
const crypto = require("crypto");
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.paymentMethod !== "RAZORPAY") {
      return res.status(400).json({
        success: false,
        message: "This order does not use Razorpay.",
      });
    }

    if (order.paymentStatus !== "PENDING" || order.razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Payment is already initiated or the order is not payable.",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please create a new order.",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      message: "Razorpay order created.",
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order.",
    });
  }
};
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!order.razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order has not been created.",
      });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        order,
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature.",
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "PAID";

    await order.save(); 
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      order,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed.",
    });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };