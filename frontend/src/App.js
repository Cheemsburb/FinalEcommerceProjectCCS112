// App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import CartCheckout from "./pages/CartCheckout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

const API = "http://localhost:8000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("authToken") || "");
  const [cartStorage, setCartStorage] = useState([]);
  const navigate = useNavigate();

  // Fetch cart items from backend
  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();

      // Map backend response to frontend format
      const formattedCart = (data.items || []).map((c) => ({
        cartItemId: c.id,
        product_id: c.product?.id,
        brand: c.product?.brand,
        model: c.product?.model,
        price: Number(c.product?.price),
        image_link: c.product?.image_link,
        case_size: c.product?.case_size,
        quantity: c.quantity,
      }));

      setCartStorage(formattedCart);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setCartStorage([]);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
      fetchCart();
    } else {
      localStorage.removeItem("authToken");
      setCartStorage([]);
    }
  }, [token]);

  const signIn = (userToken) => setToken(userToken);
  const signOut = () => {
    setToken("");
    navigate("/login");
  };

  const addToCart = async (product, selectedSize) => {
    if (!token) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
      return false;
    }

    try {
      const response = await fetch(`${API}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          brand: product.brand,
          model: product.model || product.name,
          price: product.price,
          image_link: product.image_link || product.image,
          case_size: selectedSize || product.case_size || "N/A",
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to add item to cart.");
        return false;
      }

      await fetchCart(); // sync cart
      return true;
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Network error. Please try again.");
      return false;
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove item");
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/cart/clear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      setCartStorage([]);
    } catch (err) {
      console.error(err);
    }
  };

  const proceedToCheckout = () => {
    if (!token) {
      alert("You must be logged in to proceed to checkout!");
      navigate("/login");
    } else {
      navigate("/cart");
    }
  };

  return (
    <>
      <Navbar proceedToCheckout={proceedToCheckout} cartCount={cartStorage.length} />
      <Routes>
        <Route
          path="/"
          element={<HomePage addToCart={addToCart} token={token} signOut={signOut} />}
        />
        <Route
          path="/products"
          element={<ProductListing addToCart={addToCart} token={token} />}
        />
        <Route
          path="/products/:id"
          element={<ProductDetails addToCart={addToCart} token={token} />}
        />
        <Route
          path="/cart"
          element={
            <CartCheckout
              cartItems={cartStorage}
              setCartItems={setCartStorage}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              token={token}
            />
          }
        />
        <Route path="/profile" element={<Profile token={token} />} />
        <Route path="/login" element={<Login signIn={signIn} />} />
        <Route path="/register" element={<Register signIn={signIn} />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
