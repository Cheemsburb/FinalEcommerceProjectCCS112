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
  const [token, setToken] = useState("")

  const signIn = (userToken)=>{
    setToken(userToken)
  }
 
  const addToCart = (product) => {
    setCartStorage((prevCartItems) => {
      // Check if the product already exists in the cart
      const existingItem = prevCartItems.find((item) => item.id === product.id);

      if (existingItem) {
        // If it exists, do nothing (return the previous cart state)
        console.log(`Product ID ${product.id} already in cart.`);
        alert(`${product.model || 'Item'} is already in your cart.`); 
        return prevCartItems;
      } else {
        // If it doesn't exist, add the new product with quantity 1
        const newItem = {
          id: product.id,
          brand: product.brand,
          model: product.model, 
          price: product.price,
          image_link: product.image,
          case_size: product.size
        };
        return [...prevCartItems, newItem];
      }
    });
  };

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
          element={<ProductDetails addToCart={addToCart} token={token}/>}
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
        <Route path="/profile" element={<Profile token={token}/> }/>
        <Route path="/login" element={<Login signIn={signIn}/>}/>
        <Route path="/register" element={<Register signIn={signIn}/>}/>
      </Routes>
      <Footer />
    </>
  );
}

export default App;