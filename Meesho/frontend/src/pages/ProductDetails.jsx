
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");

      try {
        // Fetch the product list and find the matching MongoDB ID.
        // This works with the existing GET /api/products endpoint.
        const { data } = await API.get("/products", {
          params: { limit: 100 },
        });

        const products = data.products || [];
        const found = products.find((item) => item._id === id);

        if (!found) {
          setError("Product not found.");
          return;
        }

        setProduct(found);

        const sizes = Array.isArray(found.sizes_available)
          ? found.sizes_available
          : [];

        const colors = Array.isArray(found.colors_available)
          ? found.colors_available
          : [];

        setSelectedSize(sizes[0] || "");
        setSelectedColor(colors[0] || "");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load product details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  async function handleAddToCart() {
    setMessage("");
    setError("");

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if (!product?._id) {
      setError("Product details are unavailable.");
      return;
    }

    setAdding(true);

    try {
      const { data } = await API.post("/cart", {
        productId: product._id,
        quantity,
        selectedSize,
        selectedColor,
      });

      if (data.success) {
        setMessage("Product added to your cart!");
      } else {
        setError(data.message || "Unable to add product.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to add product to cart."
      );
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status" />
        <p className="mt-2">Loading product...</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-circle display-4 text-danger" />
        <h4 className="mt-3">{error}</h4>
        <button
          className="btn btn-danger mt-2"
          onClick={() => navigate("/products")}
        >
          Browse Products
        </button>
      </div>
    );
  }

  if (!product) return null;

  const price = Number(product.discounted_price) || 0;
  const originalPrice = Number(product.original_price) || price;
  const discount = Number(product.discount_percentage) || 0;

  const sizes = Array.isArray(product.sizes_available)
    ? product.sizes_available
    : [];

  const colors = Array.isArray(product.colors_available)
    ? product.colors_available
    : [];

  const stockAvailable =
    product.availability !== false &&
    product.availability !== "out_of_stock";

  return (
    <div className="container py-4 py-md-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => navigate("/")}
            >
              Home
            </button>
          </li>
          <li className="breadcrumb-item">
            <button
              className="btn btn-link p-0 text-decoration-none"
              onClick={() => navigate("/products")}
            >
              Products
            </button>
          </li>
          <li
            className="breadcrumb-item active text-truncate"
            aria-current="page"
          >
            {product.title}
          </li>
        </ol>
      </nav>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="status">
          <i className="bi bi-check-circle me-2" />
          {message}
          <button
            className="btn btn-sm btn-outline-success ms-3"
            onClick={() => navigate("/cart")}
          >
            View Cart
          </button>
        </div>
      )}

      <div className="row g-4 g-lg-5">
        <div className="col-12 col-md-6">
          <div
            className="bg-white border rounded-4 d-flex align-items-center justify-content-center p-3"
            style={{ minHeight: 300 }}
          >
            <img
              src={product.image_url}
              alt={product.title}
              className="img-fluid"
              style={{
                maxHeight: 500,
                width: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        <div className="col-12 col-md-6">
          <p className="text-muted mb-2">
            {product.brand || product.category || "Product"}
          </p>

          <h2 className="fw-bold">{product.title}</h2>

          {product.rating != null && (
            <div className="mb-3">
              <span className="badge bg-success">
                {Number(product.rating).toFixed(1)} ★
              </span>
              <span className="text-muted ms-2">
                {product.review_count || 0} reviews
              </span>
            </div>
          )}

          <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
            <span className="fs-2 fw-bold">
              ₹{price.toFixed(2)}
            </span>

            {originalPrice > price && (
              <del className="text-muted">
                ₹{originalPrice.toFixed(2)}
              </del>
            )}

            {discount > 0 && (
              <span className="text-danger fw-semibold">
                {discount}% OFF
              </span>
            )}
          </div>

          <p className="text-success small mb-4">
            <i className="bi bi-truck me-2" />
            {product.delivery_time || "Delivery details available at checkout"}
          </p>

          {product.description && (
            <div className="mb-4">
              <h5 className="fw-semibold">Product Description</h5>
              <p className="text-secondary">
                {product.description}
              </p>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mb-4">
              <label htmlFor="productSize" className="form-label fw-semibold">
                Select Size
              </label>
              <select
                id="productSize"
                className="form-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-4">
              <label htmlFor="productColor" className="form-label fw-semibold">
                Select Color
              </label>
              <select
                id="productColor"
                className="form-select"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="quantity" className="form-label fw-semibold">
              Quantity
            </label>

            <div className="input-group" style={{ maxWidth: 160 }}>
              <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
              >
                <i className="bi bi-dash" />
              </button>

              <input
                id="quantity"
                type="number"
                className="form-control text-center"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isInteger(value) && value >= 1 && value <= 10) {
                    setQuantity(value);
                  }
                }}
              />

              <button
                type="button"
                className="btn btn-outline-secondary"
                aria-label="Increase quantity"
                disabled={quantity >= 10}
                onClick={() =>
                  setQuantity((current) => Math.min(10, current + 1))
                }
              >
                <i className="bi bi-plus" />
              </button>
            </div>
            <small className="text-muted">Maximum 10 per addition.</small>
          </div>

          {!stockAvailable && (
            <div className="alert alert-warning">
              This product may currently be unavailable.
            </div>
          )}

          <div className="d-grid d-sm-flex gap-3">
            <button
              type="button"
              className="btn btn-danger btn-lg flex-grow-1"
              onClick={handleAddToCart}
              disabled={adding || !stockAvailable}
            >
              {adding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Adding...
                </>
              ) : (
                <>
                  <i className="bi bi-cart-plus me-2" />
                  Add to Cart
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-danger btn-lg flex-grow-1"
              onClick={() => navigate("/cart")}
            >
              <i className="bi bi-cart me-2" />
              View Cart
            </button>
          </div>

          <hr className="my-4" />

          <div className="d-flex flex-column gap-2 text-secondary small">
            {product.cod_available !== false && (
              <span>
                <i className="bi bi-cash-coin me-2" />
                Cash on Delivery may be available
              </span>
            )}

            {product.return_policy && (
              <span>
                <i className="bi bi-arrow-counterclockwise me-2" />
                {product.return_policy}
              </span>
            )}

            {product.material && (
              <span>
                <i className="bi bi-box-seam me-2" />
                Material: {product.material}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}