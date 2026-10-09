const Product = require("../models/Product");
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      minRating,
      size,
      sort,
      page = 1,
      limit = 20,
    } = req.query; 
    const query = {}; 
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { brand: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }
    if (category) {
      query.category = { $regex: `^${category}$`, $options: "i" };
    }
    if (subcategory) {
      query.subcategory = {
        $regex: `^${subcategory}$`,
        $options: "i",
      };
    }
    if (brand) {
      query.brand = { $regex: `^${brand}$`, $options: "i" };
    } 
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.discounted_price = {};

      if (minPrice !== undefined) {
        query.discounted_price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        query.discounted_price.$lte = Number(maxPrice);
      }
    } 
    if (minRating !== undefined) {
      query.rating = { $gte: Number(minRating) };
    } 
    if (size) {
      query.sizes_available = {
        $regex: `^${size}$`,
        $options: "i",
      };
    }
    const sortOptions = {
      price_asc: { discounted_price: 1 },
      price_desc: { discounted_price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
      popularity: { review_count: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 20)
    );
    const skip = (currentPage - 1) * pageLimit;
    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Product.countDocuments(query),
    ]);
    res.status(200).json({
      success: true,
      totalProducts,
      currentPage,
      totalPages: Math.ceil(totalProducts / pageLimit),
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
module.exports = { getProducts };