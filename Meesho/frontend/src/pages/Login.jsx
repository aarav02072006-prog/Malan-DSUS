import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const { data } = await API.post("/auth/login", form);

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError(data.message || "Login failed. Token not received.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login. Check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 440 }}>
        <div className="card-body p-4 p-md-5">
          <h2 className="fw-bold mb-2">Welcome Back!</h2>
          <p className="text-secondary mb-4">Login to your account</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              className="btn text-white w-100 py-2"
              style={{ backgroundColor: "#9f2089" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}