require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database.js");
const productRoutes = require("./routes/productRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});
const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}
startServer();