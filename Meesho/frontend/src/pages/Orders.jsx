import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data } = await API.get("/orders/my-orders");
        setOrders(data.orders || []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
        } else {
          setError(err.response?.data?.message || "Unable to load orders.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: "#9f2089" }} />
        <p className="mt-3">Loading your orders...</p>
      </div>
    );
  }

  return (
    <main className="container py-4 py-md-5">
      <h2 className="fw-bold mb-4">My Orders</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-1 text-secondary" />
          <h4 className="mt-3">No orders yet</h4>
          <p className="text-secondary">
            Your placed orders will appear here.
          </p>
          <Link
            to="/products"
            className="btn text-white px-4"
            style={{ backgroundColor: "#9f2089" }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        orders.map((order) => (
          <article
            key={order._id}
            className="card border-0 shadow-sm mb-4"
          >
            <div className="card-body p-3 p-md-4">
              <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
                <div>
                  <h6 className="fw-bold mb-1">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h6>
                  <small className="text-secondary">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN")
                      : ""}
                  </small>
                </div>

                <div className="text-md-end">
                  <span className="badge bg-light text-dark border me-2">
                    {order.orderStatus || "PLACED"}
                  </span>
                  <span
                    className={`badge ${
                      order.paymentStatus === "PAID"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {order.paymentStatus || "PENDING"}
                  </span>
                </div>
              </div>

              {order.items?.map((item, index) => (
                <div
                  key={item._id || `${order._id}-${index}`}
                  className="d-flex align-items-center gap-3 py-3 border-top"
                >
                  <img
                    src={item.image || ""}
                    alt={item.title || "Product"}
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                    style={{
                      width: 75,
                      height: 85,
                      objectFit: "contain",
                      background: "#f8f8f8",
                      borderRadius: 8,
                    }}
                  />

                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.title || "Product"}</h6>
                    <p className="small text-secondary mb-1">
                      Quantity: {item.quantity}
                    </p>
                    {item.selectedSize && (
                      <p className="small text-secondary mb-1">
                        Size: {item.selectedSize}
                      </p>
                    )}
                    <strong>
                      ₹{(
                        (Number(item.price) || 0) * item.quantity
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              ))}

              <div className="border-top pt-3 d-flex justify-content-between align-items-center gap-2 flex-wrap">
                <span className="text-secondary small">
                  Payment: {order.paymentMethod || "COD"}
                </span>
                <strong>
                  Total: ₹{(Number(order.totalAmount) || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </article>
        ))
      )}
    </main>
  );
}