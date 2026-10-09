
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, [navigate]);

  async function fetchCart() {
    try {
      setLoading(true);
      const { data } = await API.get("/cart");

      if (data.success) {
        setCart(data.cart || { items: [] });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message || "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const items = cart?.items || [];

  const subtotal = items.reduce((total, item) => {
    const price = Number(item.product?.discounted_price) || 0;
    const quantity = Number(item.quantity) || 0;

    return total + price * quantity;
  }, 0);

  const deliveryCharge = subtotal > 0 ? 0 : 0;
  const total = subtotal + deliveryCharge;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty. Please add a product first.");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Create the order using the backend's expected fields.
      const { data } = await API.post("/orders", {
        shippingAddress: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          addressLine: form.addressLine.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        paymentMethod,
      });

      if (!data.success || !data.order?._id) {
        throw new Error(data.message || "Unable to create order.");
      }

      const orderId = data.order._id;

      // Step 2: COD orders are already placed by the backend.
      if (paymentMethod === "COD") {
        navigate("/orders");
        return;
      }

      // Step 3: Create a Razorpay order on the backend.
      const { data: payment } = await API.post(
        "/payments/create-order",
        { orderId }
      );

      if (!payment.success) {
        throw new Error(
          payment.message || "Unable to initialize online payment."
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay checkout failed to load. Please refresh and try again."
        );
      }

      // Step 4: Open Razorpay's checkout window.
      const options = {
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: "Meesho Store",
        description: "Order payment",
        order_id: payment.razorpayOrderId,

        prefill: {
          name: form.name.trim(),
          contact: form.phone.trim(),
        },

        theme: {
          color: "#9f2089",
        },

        // Step 5: Verify the payment on the backend.
        handler: async function (response) {
          try {
            setError("");

            const { data: verification } = await API.post(
              "/payments/verify",
              {
                orderId: payment.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (!verification.success) {
              throw new Error(
                verification.message || "Payment verification failed."
              );
            }

            navigate("/orders");
          } catch (err) {
            setError(
              err.response?.data?.message ||
                err.message ||
                "Payment verification failed. Please contact support before retrying."
            );
          }
        },

        modal: {
          ondismiss: function () {
            setError(
              "Payment was not completed. Your order may remain pending."
            );
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Checkout failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status" />
        <p className="mt-2">Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-3 p-md-4">
              <h3 className="fw-bold mb-1">Checkout</h3>
              <p className="text-muted mb-4">
                Enter your delivery address and choose a payment method.
              </p>

              {error && (
                <div
                  className="alert alert-danger"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <h5 className="fw-semibold mb-3">
                  <i className="bi bi-geo-alt me-2" />
                  Delivery Address
                </h5>

                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="name" className="form-label">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="form-control"
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label
                      htmlFor="addressLine"
                      className="form-label"
                    >
                      House No., Street, Area
                    </label>
                    <textarea
                      id="addressLine"
                      name="addressLine"
                      className="form-control"
                      rows="2"
                      placeholder="Enter your complete address"
                      value={form.addressLine}
                      onChange={handleChange}
                      autoComplete="street-address"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className="form-control"
                      placeholder="City"
                      value={form.city}
                      onChange={handleChange}
                      autoComplete="address-level2"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="state" className="form-label">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      className="form-control"
                      placeholder="State"
                      value={form.state}
                      onChange={handleChange}
                      autoComplete="address-level1"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="pincode" className="form-label">
                      PIN Code
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      className="form-control"
                      placeholder="6-digit PIN code"
                      value={form.pincode}
                      onChange={handleChange}
                      autoComplete="postal-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>

                <hr className="my-4" />

                <h5 className="fw-semibold mb-3">
                  <i className="bi bi-credit-card me-2" />
                  Payment Method
                </h5>

                <div className="d-grid gap-3">
                  <label
                    className={`border rounded-3 p-3 d-flex align-items-center gap-3 ${
                      paymentMethod === "COD"
                        ? "border-danger bg-light"
                        : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      className="form-check-input mt-0"
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />
                    <i className="bi bi-cash-coin fs-3 text-success" />
                    <span>
                      <strong className="d-block">
                        Cash on Delivery
                      </strong>
                      <small className="text-muted">
                        Pay when your order arrives.
                      </small>
                    </span>
                  </label>

                  <label
                    className={`border rounded-3 p-3 d-flex align-items-center gap-3 ${
                      paymentMethod === "RAZORPAY"
                        ? "border-danger bg-light"
                        : ""
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      className="form-check-input mt-0"
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />
                    <i className="bi bi-shield-lock fs-3 text-primary" />
                    <span>
                      <strong className="d-block">
                        Online Payment
                      </strong>
                      <small className="text-muted">
                        Pay securely using Razorpay test mode.
                      </small>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-danger btn-lg w-100 mt-4"
                  disabled={submitting || items.length === 0}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Processing...
                    </>
                  ) : paymentMethod === "COD" ? (
                    "Place Order"
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-3 p-md-4">
              <h5 className="fw-bold mb-3">Order Summary</h5>

              {items.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-cart-x display-4 text-muted" />
                  <p className="mt-2 mb-3">Your cart is empty.</p>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => navigate("/products")}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="d-flex flex-column gap-3">
                    {items.map((item) => {
                      const product = item.product;

                      if (!product) return null;

                      const price =
                        Number(product.discounted_price) || 0;

                      return (
                        <div
                          className="d-flex align-items-center gap-3"
                          key={item._id}
                        >
                          <img
                            src={product.image_url}
                            alt={product.title || "Product"}
                            className="rounded-3 border"
                            style={{
                              width: 70,
                              height: 80,
                              objectFit: "contain",
                              flexShrink: 0,
                            }}
                          />

                          <div className="flex-grow-1">
                            <p className="mb-1 fw-semibold">
                              {product.title}
                            </p>

                            <small className="text-muted d-block">
                              Qty: {item.quantity}
                            </small>

                            {item.selectedSize && (
                              <small className="text-muted d-block">
                                Size: {item.selectedSize}
                              </small>
                            )}

                            {item.selectedColor && (
                              <small className="text-muted d-block">
                                Color: {item.selectedColor}
                              </small>
                            )}
                          </div>

                          <strong className="text-nowrap">
                            ₹{(price * item.quantity).toFixed(2)}
                          </strong>
                        </div>
                      );
                    })}
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      Delivery Charges
                    </span>
                    <span className="text-success">
                      {deliveryCharge === 0
                        ? "FREE"
                        : `₹${deliveryCharge.toFixed(2)}`}
                    </span>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="fs-5">Total</strong>
                    <strong className="fs-4 text-danger">
                      ₹{total.toFixed(2)}
                    </strong>
                  </div>

                  <p className="text-muted small mt-3 mb-0">
                    <i className="bi bi-shield-check me-1" />
                    Your payment is handled through the selected
                    payment method.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}