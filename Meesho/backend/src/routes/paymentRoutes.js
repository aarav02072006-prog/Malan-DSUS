const express = require("express");
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require("../controllers/paymentController.js");
const { protect } = require("../middleware/authMiddleware.js");
router.use(protect);
router.post("/create-order", createRazorpayOrder);
router.post("/verify",verifyRazorpayPayment);
module.exports = router;