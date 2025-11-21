// Sarmiento
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import styles from "./styles/CartCheckout.module.css";
import images from "../assets/imageLoader";

const API = "http://localhost:8000/api";

function CartCheckout({ cartItems, setCartItems, removeFromCart, clearCart, token }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    address: "",
    contact: "",
    payment: "",
  });

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountRate, setDiscountRate] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoStatus, setPromoStatus] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // Fetch cart items when component mounts or token changes
  useEffect(() => {
    if (!token) {
      alert("Please log in to access the cart.");
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await fetch(`${API}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCartItems(data);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();

    // Optional: listen to custom cartUpdated event
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [token, navigate, setCartItems]);

  const handleConfirmRemove = () => {
    if (itemToRemove) {
      removeFromCart(itemToRemove);
      setItemToRemove(null);
    }
  };
  const handleCancelRemove = () => setItemToRemove(null);

  const deliveryFee = cartItems.length > 0 ? 10000 : 0;
  const getSubtotal = () => cartItems.reduce((sum, item) => sum + item.price, 0);
  const getDiscount = () => getSubtotal() * discountRate;
  const getTotal = () => getSubtotal() - getDiscount() + deliveryFee;

  const showMessage = (msg, status) => {
    setPromoMessage(msg);
    setPromoStatus(status);
    setTimeout(() => {
      setPromoMessage("");
      setPromoStatus("");
    }, 3000);
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (promoApplied) {
      showMessage("Promo code already used.", "error");
      return;
    }
    if (code === "WTCH.CO") {
      setDiscountRate(0.1);
      setPromoApplied(true);
      showMessage("10% Discount Applied!", "success");
    } else {
      showMessage("Invalid promo code.", "error");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create order
      await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address_id: 1,
          billing_address_id: 1,
        }),
      });

      alert(`Checkout successful!\n\nThank you, ${form.name}! Your order is being processed.`);

      // Clear cart items
      for (const item of cartItems) {
        await fetch(`${API}/cart/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      clearCart(); // Update App.js state
    } catch (err) {
      console.error("Checkout error:", err);
    }

    setShowForm(false);
    setForm({ name: "", address: "", contact: "", payment: "" });
    setPromoCode("");
    setPromoApplied(false);
    setDiscountRate(0);
    setPromoMessage("");
    setPromoStatus("");
};

  if (loading) return <p>Loading cart...</p>;

  return (
    <section className={styles.cartPage}>
      <h2 className={styles.yourCart}>Your Cart</h2>
      <div className={styles.cartLayout}>
        {/* Cart Items Section */}
        {cartItems.length > 0 ? (
          <ul className={styles.cartList}>
            {cartItems.map((item) => {
              const imageSrc = images[item.image_link];
              return (
                <li key={item.id} className={styles.cartItem}>
                  <img
                    src={imageSrc}
                    alt={item.model || item.name}
                    className={styles.productImage}
                  />
                  <div className={styles.itemDetails}>
                    <strong className={styles.itemTitle}>
                      {item.brand} | {item.model || item.name}
                    </strong>
                    <span className={styles.itemSize}>
                      Size: {item.case_size || "N/A"}
                    </span>
                    <span className={styles.itemPrice}>
                      ₱{item.price.toLocaleString()}
                    </span>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setItemToRemove(item.id)}
                    title="Remove item"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
            <p className={styles.emptyCart}>Your cart is empty.</p>
        )}

        {/* Checkout Summary */}
        {cartItems.length > 0 && (
          <section className={styles.checkoutSection}>
            <h3 className={styles.orderSummary}>Order Summary</h3>
            <div className={styles.summaryDetails}>
              <p>
                <span>Subtotal</span>
                <span>₱{getSubtotal().toLocaleString()}</span>
              </p>
              <p>
                <span>Discount ({(discountRate * 100).toFixed(0)}%)</span>
                <span className={styles.discountAmount}>
                  -₱{getDiscount().toLocaleString()}
                </span>
              </p>
              <p>
                <span>Delivery Fee</span>
                <span>₱{deliveryFee.toLocaleString()}</span>
              </p>
              <hr className={styles.summaryDivider} />
              <p className={styles.totalAmount}>
                <strong>Total</strong>
                <strong>₱{getTotal().toLocaleString()}</strong>
              </p>

              {/* Promo Code */}
              <div className={styles.promoSection}>
                <input
                  className={`${styles.promoInput} ${
                    promoStatus === "success"
                      ? styles.success
                      : promoStatus === "error"
                      ? styles.error
                      : ""
                  }`}
                  type="text"
                  placeholder="Add promo code"
                  value={promoMessage ? promoMessage : promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    if (promoMessage) {
                      setPromoMessage("");
                      setPromoStatus("");
                    }
                  }}
                  disabled={promoApplied}
                  aria-label="Promo Code"
                />
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={applyPromo}
                  disabled={promoApplied}
                >
                  {promoApplied ? "Applied" : "Apply"}
                </button>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                className={styles.orderBtn}
                onClick={() => setShowForm(true)}
              >
                Go to Checkout
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Checkout Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Checkout Details</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Full Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Complete Address
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Contact Number
                <input
                  type="tel"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Mode of Payment
                <select
                  name="payment"
                  value={form.payment}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="GCash">GCash</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </label>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.confirmBtn}>
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {itemToRemove && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModalContent}>
            <h3 className={styles.confirmTitle}>Remove Item</h3>
            <p className={styles.confirmText}>
              Are you sure you want to remove this item from your cart?
            </p>
            <div className={styles.confirmButtons}>
              <button
                type="button"
                className={styles.confirmBtnSecondary}
                onClick={handleCancelRemove}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmBtnPrimary}
                onClick={handleConfirmRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartCheckout;
