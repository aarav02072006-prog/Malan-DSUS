const Cart = require("../models/Carts.js");
const Product = require("../models/Product.js");
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedSize = "", selectedColor = "" } = req.body;
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid productId and quantity are required",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (
      selectedSize &&
      !(product.sizes_available || []).some(
        (size) => size.toLowerCase() === selectedSize.toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected size is not available",
      });
    }
    if (
      selectedColor &&
      !(product.colors_available || []).some(
        (color) => color.toLowerCase() === selectedColor.toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected color is not available",
      });
    }
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        selectedSize,
        selectedColor,
      });
    }
    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");
    res.status(200).json({
      success: true,
      cart: cart || { items: [] },
    });
  } catch (error) {
    console.error("Get cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }
    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (error) {
    console.error("Update cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }
    item.deleteOne();
    await cart.save();
    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};
module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
};