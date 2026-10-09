
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";

const categories = [
  { name: "Women Ethnic", icon: "bi-stars", search: "women ethnic" },
  { name: "Western Wear", icon: "bi-person-standing-dress", search: "western wear" },
  { name: "Men", icon: "bi-person", search: "men" },
  { name: "Kids", icon: "bi-balloon", search: "kids" },
  { name: "Home & Kitchen", icon: "bi-house", search: "home kitchen" },
  { name: "Beauty", icon: "bi-brush", search: "beauty" },
  { name: "Accessories", icon: "bi-handbag", search: "accessories" },
  { name: "Footwear", icon: "bi-sunglasses", search: "footwear" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/products", {
          params: { limit: 10, sort: "popularity" },
        });

        if (active) {
          setProducts(response.data.products || []);
        }
      } catch (err) {
        if (active) {
          setError("Unable to load products. Please try again.");
          console.error("Home products error:", err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-container py-3 py-md-4">
      <section
        className="rounded-4 p-4 p-md-5 mb-4 mb-md-5"
        style={{
          background: "linear-gradient(120deg, #fce7f3, #f3e8ff)",
        }}
      >
        <div className="row align-items-center g-4">
          <div className="col-12 col-md-7">
            <span
              className="badge rounded-pill mb-3"
              style={{ backgroundColor: "#9f2089" }}
            >
              EVERYDAY STYLE, BETTER PRICES
            </span>

            <h1 className="display-6 fw-bold mb-3">
              Find your style.
              <br />
              Love the price.
            </h1>

            <p className="text-secondary mb-4">
              Explore fashion, accessories, home essentials and more.
            </p>

            <Link
              to="/products"
              className="btn text-white px-4 py-2"
              style={{ backgroundColor: "#9f2089" }}
            >
              Shop Now <i className="bi bi-arrow-right ms-2" />
            </Link>
          </div>

          <div className="col-12 col-md-5 text-center">
            <i
              className="bi bi-bag-heart"
              aria-hidden="true"
              style={{ fontSize: "clamp(5rem, 15vw, 9rem)", color: "#9f2089" }}
            />
          </div>
        </div>
      </section>

      <section className="mb-4 mb-md-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-bold mb-0">Shop by Category</h2>
          <Link
            to="/products"
            className="small text-decoration-none fw-semibold"
            style={{ color: "#9f2089" }}
          >
            View all
          </Link>
        </div>

        <div className="row row-cols-2 row-cols-sm-4 row-cols-lg-8 g-2 g-md-3">
          {categories.map((category) => (
            <div className="col" key={category.name}>
              <Link
                to={`/products?search=${encodeURIComponent(category.search)}`}
                className="d-flex flex-column align-items-center justify-content-center text-center text-decoration-none text-dark border rounded-3 p-3 h-100"
              >
                <i
                  className={`bi ${category.icon} mb-2`}
                  aria-hidden="true"
                  style={{ fontSize: "1.8rem", color: "#9f2089" }}
                />
                <span className="small fw-semibold">{category.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-bold mb-0">Popular Products</h2>
          <Link
            to="/products?sort=popularity"
            className="small text-decoration-none fw-semibold"
            style={{ color: "#9f2089" }}
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: "#9f2089" }} />
            <p className="text-secondary mt-2 mb-0">Loading products...</p>
          </div>
        ) : error ? (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        ) : products.length === 0 ? (
          <p className="text-secondary py-4">
            No products are available right now.
          </p>
        ) : (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2 g-md-3">
            {products.map((product) => (
              <div className="col" key={product._id || product.product_id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}