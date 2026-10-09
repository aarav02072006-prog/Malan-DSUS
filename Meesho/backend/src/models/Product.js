const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "",
    },
    subcategory: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "",
    },
    original_price: {
      type: Number,
      default: 0,
      min: 0,
    },
    discounted_price: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount_percentage: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    availability: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    seller_name: {
      type: String,
      default: "",
    },
    image_url: {
      type: String,
      default: "",
    },
    product_url: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    colors_available: {
      type: [String],
      default: [],
    },
    sizes_available: {
      type: [String],
      default: [],
    },
    material: {
      type: String,
      default: "",
    },
    cod_available: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    return_policy: {
      type: String,
      default: "",
    },
    delivery_time: {
      type: String,
      default: "",
    },
    scraped_at: {
      type: String,
      default: "",
    },
    source_page: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);