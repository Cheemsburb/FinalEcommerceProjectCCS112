// Correllene Ira Salar
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import HomePage from "./pages/HomePage";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import CartCheckout from "./pages/CartCheckout";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  const [cartStorage, setCartStorage] = useState([]);

  // --- MODIFIED addToCart Function ---
  const addToCart = (product) => {
    // IMPORTANT: Ensure the 'product' object passed here from ProductDetails
    // contains all necessary fields: id, brand, model, price, image_link, case_size

    setCartStorage((prevCartItems) => {
      // Check if the product already exists in the cart
      const existingItem = prevCartItems.find((item) => item.id === product.id);

      if (existingItem) {
        // If it exists, do nothing (return the previous cart state)
        // Optionally, you could show a message to the user here
        console.log(`Product ID ${product.id} already in cart.`);
        alert(`${product.model || 'Item'} is already in your cart.`); // Simple alert message
        return prevCartItems;
      } else {
        // If it doesn't exist, add the new product with quantity 1
        // Explicitly include all needed properties to ensure they are saved
        const newItem = {
          id: product.id,
          brand: product.brand,
          model: product.model, // or product.name if that's sometimes used
          price: product.price,
          image_link: product.image,
          case_size: product.size
        };
        return [...prevCartItems, newItem];
      }
    });
  };
  // --- END of MODIFIED addToCart Function ---


  const removeFromCart = (id) => {
    setCartStorage((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartStorage([]);
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListing />} />
        <Route
          path="/products/:id"
          // Make sure ProductDetails fetches and passes the FULL product object to addToCart
          element={<ProductDetails addToCart={addToCart} />}
        />
        <Route
          path="/cart"
          element={
            <CartCheckout
              cartItems={cartStorage}
              setCartItems={setCartStorage} // Pass the setter if needed for quantity updates later
              removeFromCart={removeFromCart}
              clearCart={clearCart}
            />
          }
        />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
      </Routes>
      <Footer />
    </>
  );
}

export default App;