const express = require("express");
const router = express.Router();
const {addToCart, getCart, updateCartItem, removeFromCart,
} = require("../controllers/cartControllers.js");
const { protect } = require("../middleware/authMiddleware.js");
router.use(protect);
router.get("/", getCart);
router.post("/", addToCart);
router.patch("/:itemId", updateCartItem);
router.delete("/:itemId", removeFromCart);
module.exports = router;