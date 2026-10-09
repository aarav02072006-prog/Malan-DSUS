import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const navigate = useNavigate();

  async function fetchCart() {
    setLoading(true);
    setError("");

    try {
      const { data } = await API.get("/cart");
      setItems(data.cart?.items || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;

    setBusyId(itemId);
    setError("");

    try {
      const { data } = await API.patch(`/cart/${itemId}`, { quantity });
      setItems(data.cart?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update quantity.");
    } finally {
      setBusyId("");
    }
  }

  async function removeItem(itemId) {
    setBusyId(itemId);
    setError("");

    try {
      const { data } = await API.delete(`/cart/${itemId}`);
      setItems(data.cart?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove this item.");
    } finally {
      setBusyId("");
    }
  }

  const total = items.reduce((sum, item) => {
    const price = Number(item.product?.discounted_price) || 0;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: "#9f2089" }} />
        <p className="mt-3">Loading your cart...</p>
      </div>
    );
  }

  return (
    <main className="container py-4 py-md-5">
      <h2 className="fw-bold mb-4">My Shopping Cart</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {items.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-bag display-1 text-secondary" />
          <h4 className="mt-3">Your cart is empty</h4>
          <p className="text-secondary">Find something you love!</p>
          <Link
            to="/products"
            className="btn text-white px-4"
            style={{ backgroundColor: "#9f2089" }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              const price = Number(product.discounted_price) || 0;
              const originalPrice = Number(product.original_price) || price;

              return (
                <article
                  key={item._id}
                  className="card border-0 shadow-sm mb-3"
                >
                  <div className="card-body">
                    <div className="d-flex gap-3">
                      <img
                        src={product.image_url || ""}
                        alt={product.title || "Product"}
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                        style={{
                          width: "105px",
                          height: "125px",
                          objectFit: "contain",
                          background: "#f8f8f8",
                          borderRadius: "8px",
                        }}
                      />

                      <div className="flex-grow-1 min-width-0">
                        <h6 className="fw-semibold">
                          {product.title || "Product"}
                        </h6>

                        <p className="small text-secondary mb-2">
                          {product.brand || product.category || ""}
                        </p>

                        {item.selectedSize && (
                          <p className="small mb-1">
                            Size: {item.selectedSize}
                          </p>
                        )}

                        {item.selectedColor && (
                          <p className="small mb-1">
                            Color: {item.selectedColor}
                          </p>
                        )}

                        <div className="mb-2">
                          <strong>₹{price.toLocaleString("en-IN")}</strong>
                          {originalPrice > price && (
                            <span className="small text-secondary text-decoration-line-through ms-2">
                              ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <div className="d-flex align-items-center flex-wrap gap-2">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              disabled={item.quantity <= 1 || busyId === item._id}
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <span className="btn btn-outline-secondary disabled">
                              {item.quantity}
                            </span>

                            <button
                              className="btn btn-outline-secondary"
                              disabled={busyId === item._id}
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="btn btn-sm btn-link text-danger text-decoration-none"
                            disabled={busyId === item._id}
                            onClick={() => removeItem(item._id)}
                          >
                            <i className="bi bi-trash me-1" />
                            Remove
                          </button>

                          {busyId === item._id && (
                            <span className="small text-secondary">
                              Updating...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: 100 }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Price Details</h5>

                <div className="d-flex justify-content-between mb-3">
                  <span>Total items</span>
                  <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal</span>
                  <strong>₹{total.toLocaleString("en-IN")}</strong>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span>Delivery</span>
                  <span className="text-success">Free</span>
                </div>

                <hr />

                <div className="d-flex justify-content-between fw-bold mb-4">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>

                <button
                  className="btn text-white w-100 py-2"
                  style={{ backgroundColor: "#9f2089" }}
                  onClick={() => navigate("/checkout")}
                >
                  Continue to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}