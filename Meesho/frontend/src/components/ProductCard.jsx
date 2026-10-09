
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const price = Number(product.discounted_price) || 0;
  const originalPrice = Number(product.original_price) || price;
  const discount = Number(product.discount_percentage) || 0;

  async function handleAddToCart(e) {
    e.stopPropagation();

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if (!product._id) {
      setMessage("Product ID is missing.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await API.post("/cart", {
        productId: product._id,
        quantity: 1,
      });

      setMessage("Added to cart!");
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setMessage(
          error.response?.data?.message || "Could not add product."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card product-card h-100 border-0 shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/products/${product._id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            navigate(`/products/${product._id}`);
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <div className="product-image-wrapper position-relative">
          <img
            src={product.image_url}
            alt={product.title || "Product"}
            className="product-image"
            loading="lazy"
          />

          {discount > 0 && (
            <span className="badge bg-danger position-absolute top-0 start-0 m-2">
              {discount}% OFF
            </span>
          )}
        </div>

        <div className="card-body pb-2">
          <h6 className="product-title mb-2">
            {product.title}
          </h6>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <strong>₹{price.toFixed(2)}</strong>

            {originalPrice > price && (
              <del className="text-muted small">
                ₹{originalPrice.toFixed(2)}
              </del>
            )}
          </div>

          {product.rating != null && (
            <div className="small mt-2">
              <span className="badge bg-success">
                {Number(product.rating).toFixed(1)} ★
              </span>

              <span className="text-muted ms-2">
                ({product.review_count || 0} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="card-body pt-0 mt-auto">
        <button
          type="button"
          className="btn btn-outline-danger w-100"
          onClick={handleAddToCart}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add to Cart"}
        </button>

        {message && (
          <p className="small text-center mt-2 mb-0" role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}