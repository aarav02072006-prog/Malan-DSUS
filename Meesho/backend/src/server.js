require ("dotenv").config();
const connectDB=require("./config/database.js");
const productRoutes = require("./routes/productRoutes");
const express=require("express");
const app=express();
connectDB();
app.use("/api/products", productRoutes);
const PORT=process.env.PORT || 5000;
app.listen(PORT,(req,res)=>{
    console.log(`server running on ${PORT}`);
});
