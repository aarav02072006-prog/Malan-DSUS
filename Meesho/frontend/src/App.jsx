import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
function PlaceholderPage({ title }) {
  return (
    <div className="container py-5 text-center">
      <h2>{title}</h2>
      <p className="text-muted">This page is coming soon.</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h2>404 - Page Not Found</h2>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/products/:id" element={<ProductDetails />} />
      </Routes>
    </BrowserRouter>
  );
}