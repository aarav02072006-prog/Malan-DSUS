import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    const value = search.trim();

    if (value) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  }

  return (
    <header className="bg-white border-bottom sticky-top">
      <div className="page-container">
        <div className="d-flex align-items-center gap-3 py-3 flex-wrap flex-md-nowrap">
          <Link
            to="/"
            className="text-decoration-none fw-bold fs-3 flex-shrink-0"
            style={{ color: "#9f2089" }}
          >
            Shop
          </Link>

          <form
            onSubmit={handleSearch}
            className="d-flex flex-grow-1 order-3 order-md-2"
            role="search"
          >
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-search" aria-hidden="true" />
              </span>

              <input
                type="search"
                className="form-control"
                placeholder="Search for products..."
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button
                className="btn text-white"
                style={{ backgroundColor: "#9f2089" }}
                type="submit"
              >
                Search
              </button>
            </div>
          </form>

          <nav className="d-flex align-items-center gap-3 order-2 order-md-3 ms-md-auto">
            <Link
              to="/login"
              className="text-dark text-decoration-none text-nowrap"
            >
              <i className="bi bi-person me-1" aria-hidden="true" />
              <span className="d-none d-sm-inline">Login</span>
            </Link>

            <Link
              to="/cart"
              className="text-dark text-decoration-none text-nowrap"
              aria-label="Shopping cart"
            >
              <i className="bi bi-bag fs-5" aria-hidden="true" />
              <span className="d-none d-sm-inline ms-1">Cart</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}