const Order = require("../models/Order");
const Cart = require("../models/Carts");

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body; 
    if (
      !shippingAddress?.name ||
      !shippingAddress?.phone ||
      !shippingAddress?.addressLine ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete shipping details.",
      });
    } 
    const method = paymentMethod || "COD";
    if (!["COD", "RAZORPAY"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }
    let totalAmount = 0;
    const orderItems = cart.items.map((item) => {
      const product = item.product;
      if (!product) {
        throw new Error("A product in your cart no longer exists.");
      }

      const price = Number(product.discounted_price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("A product has an invalid price.");
      }

      totalAmount += price * item.quantity;

      return {
        product: product._id,
        title: product.title,
        image: product.image_url || "",
        price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || "",
      };
    }); 
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod: method,
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
    });
    if (method === "COD") {
      cart.items = [];
      await cart.save();
    }
    return res.status(201).json({
      success: true,
      message:
        method === "COD"
          ? "Order placed successfully."
          : "Order created. Complete Razorpay payment next.",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order.",
    });
  }
};
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
}; 
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details.",
    });
  }
};
module.exports = { createOrder, getMyOrders, getOrderById };