import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/auth/register", form);

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError(data.message || "Registration successful. Please log in.");
        if (data.success) {
          navigate("/login");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 440 }}>
        <div className="card-body p-4 p-md-5">
          <h2 className="fw-bold mb-2">Create Account</h2>
          <p className="text-secondary mb-4">
            Join us and start shopping!
          </p>

          {error && <div className="alert alert-info">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <small className="text-secondary">
                Use at least 6 characters.
              </small>
            </div>

            <button
              className="btn text-white w-100 py-2"
              style={{ backgroundColor: "#9f2089" }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}