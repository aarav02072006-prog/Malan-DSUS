const express = require("express");
const router = express.Router();
const {protect}=require("../middleware/authMiddleware.js");
const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authControllers.js");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
module.exports = router;