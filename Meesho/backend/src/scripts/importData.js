const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const Product = require("../models/Product");
const filePath = path.join(
  __dirname,
  "../data/meeshoData.json"
);
async function importData() {
  try { 
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected"); 
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);
    const products = Array.isArray(data)
      ? data
      : data.products;
    if (!Array.isArray(products)) {
      throw new Error(
        "Products array not found. Check the dataset keys."
      );
    }
    console.log(`Found ${products.length} products`);
    let imported = 0;
    for (const product of products) {
      if (!product.product_id || !product.title) {
        continue;
      }
      await Product.updateOne(
        { product_id: String(product.product_id) },
        { $set: product },
        { upsert: true }
      );
      imported++;
    }
    console.log(`Successfully imported/updated ${imported} products`);
  } catch (error) {
    console.error("Import failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

importData();