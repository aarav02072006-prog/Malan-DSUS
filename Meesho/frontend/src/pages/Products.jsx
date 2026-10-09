
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";

const initialFilters = {
  category: "",
  subcategory: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  size: "",
  sort: "popularity",
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    ...Object.fromEntries(
      Object.keys(initialFilters)
        .filter((key) => searchParams.has(key))
        .map((key) => [key, searchParams.get(key)])
    ),
  }));
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") || "";

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const response = await API.get("/products", {
          params: { limit: 1000 },
        });

        const allProducts = response.data.products || [];

        if (!active) return;

        setCategories([...new Set(allProducts.map((p) => p.category).filter(Boolean))].sort());
        setBrands([...new Set(allProducts.map((p) => p.brand).filter(Boolean))].sort());
        setSubcategories([...new Set(allProducts.map((p) => p.subcategory).filter(Boolean))].sort());
        setSizes([...new Set(allProducts.flatMap((p) => p.sizes_available || []).filter(Boolean))].sort());
      } catch (err) {
        console.error("Filter options error:", err);
      }
    }

    loadOptions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const params = {
          limit: 20,
          page,
          ...Object.fromEntries(searchParams.entries()),
        };

        const response = await API.get("/products", { params });

        if (!active) return;

        setProducts(response.data.products || []);
        setTotalProducts(response.data.totalProducts || 0);
        setTotalPages(response.data.totalPages || 1);
      } catch (err) {
        if (active) {
          setError("Couldn't load products. Please try again.");
          console.error("Fetch products error:", err);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, [searchParams, page]);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function applyFilters(event) {
    event.preventDefault();

    const next = new URLSearchParams();

    if (search) next.set("search", search);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "") next.set(key, value);
    });

    next.set("page", "1");
    setSearchParams(next);
  }

  function resetFilters() {
    setFilters(initialFilters);

    const next = new URLSearchParams();
    if (search) next.set("search", search);
    setSearchParams(next);
  }

  function changePage(nextPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function SelectFilter({ label, name, options, placeholder }) {
    return (
      <div className="col-6 col-md-4 col-lg-3">
        <label className="form-label small fw-semibold" htmlFor={name}>
          {label}
        </label>
        <select
          id={name}
          className="form-select"
          value={filters[name]}
          onChange={(e) => updateFilter(name, e.target.value)}
        >
          <option value="">{placeholder || `All ${label}`}</option>
          {options.map((option) => {
            const value = typeof option === "string" ? option : option.value;
            const text = typeof option === "string" ? option : option.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
      </div>
    );
  }

  return (
    <main className="page-container py-4">
      <div className="rounded-4 p-4 p-md-5 mb-4 text-white"
        style={{ background: "linear-gradient(120deg, #9f2089, #d946a6)" }}>
        <p className="text-uppercase small fw-semibold mb-2">Discover your favourites</p>
        <h1 className="fw-bold mb-2">Explore Products</h1>
        <p className="mb-0 opacity-75">
          Great styles, everyday essentials and prices you'll love.
        </p>
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h5 fw-bold mb-1">
            {search ? `Results for "${search}"` : "All Products"}
          </h2>
          <p className="text-secondary small mb-0">
            {totalProducts.toLocaleString("en-IN")} products available
          </p>
        </div>
        <Link to="/" className="text-decoration-none small" style={{ color: "#9f2089" }}>
          <i className="bi bi-arrow-left me-1" /> Back to home
        </Link>
      </div>

      <form onSubmit={applyFilters} className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h6 fw-bold mb-0">
              <i className="bi bi-sliders me-2" style={{ color: "#9f2089" }} />
              Filter & Sort
            </h2>
            <button type="button" onClick={resetFilters}
              className="btn btn-sm btn-outline-secondary">
              Reset all
            </button>
          </div>

          <div className="row g-3">
            <SelectFilter label="Category" name="category" options={categories} />
            <SelectFilter label="Subcategory" name="subcategory" options={subcategories} />
            <SelectFilter label="Brand" name="brand" options={brands} />
            <SelectFilter label="Size" name="size" options={sizes} />
            <SelectFilter label="Minimum rating" name="minRating"
              options={[
                { value: "4", label: "4★ & above" },
                { value: "3", label: "3★ & above" },
                { value: "2", label: "2★ & above" },
                { value: "1", label: "1★ & above" },
              ]} />
            <SelectFilter label="Sort by" name="sort"
              options={[
                { value: "popularity", label: "Popularity" },
                { value: "price_asc", label: "Price: Low to High" },
                { value: "price_desc", label: "Price: High to Low" },
                { value: "rating", label: "Top Rated" },
                { value: "newest", label: "Newest" },
              ]} />
            <div className="col-6 col-md-4 col-lg-3">
              <label className="form-label small fw-semibold" htmlFor="minPrice">
                Minimum price (₹)
              </label>
              <input id="minPrice" type="number" min="0" className="form-control"
                placeholder="e.g. 100" value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)} />
            </div>
            <div className="col-6 col-md-4 col-lg-3">
              <label className="form-label small fw-semibold" htmlFor="maxPrice">
                Maximum price (₹)
              </label>
              <input id="maxPrice" type="number" min="0" className="form-control"
                placeholder="e.g. 1000" value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn text-white mt-3 px-4"
            style={{ backgroundColor: "#9f2089" }}>
            <i className="bi bi-funnel me-2" />Apply Filters
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: "#9f2089" }} />
          <p className="text-secondary mt-2">Finding products for you...</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-5 border rounded-4">
          <i className="bi bi-search display-4 text-secondary" />
          <h3 className="h5 mt-3">No products found</h3>
          <p className="text-secondary">Try changing your filters or search terms.</p>
          <button className="btn text-white" onClick={resetFilters}
            style={{ backgroundColor: "#9f2089" }}>Clear filters</button>
        </div>
      ) : (
        <>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-2 g-md-3">
            {products.map((product) => (
              <div className="col" key={product._id || product.product_id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="d-flex justify-content-center align-items-center gap-3 mt-4"
              aria-label="Product pagination">
              <button className="btn btn-outline-secondary" disabled={page <= 1}
                onClick={() => changePage(page - 1)}>
                <i className="bi bi-chevron-left me-1" />Previous
              </button>
              <span className="small fw-semibold">Page {page} of {totalPages}</span>
              <button className="btn btn-outline-secondary" disabled={page >= totalPages}
                onClick={() => changePage(page + 1)}>
                Next<i className="bi bi-chevron-right ms-1" />
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}