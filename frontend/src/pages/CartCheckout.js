// Sarmiento
import React, { useEffect, useState } from "react";
import styles from "./styles/CartCheckout.module.css";
import images from "../assets/imageLoader";

const API = "http://localhost:8000/api";

function CartCheckout() {
  const [cartItems, setCartItems] = useState([]);
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

  // Fetch cart items
  // Fetch cart items
  const fetchCart = async () => {
    const token = localStorage.getItem("authToken"); // FIXED
    if (!token) {
      setCartItems([]);
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    fetchCart();

    window.addEventListener("cartUpdated", fetchCart);
    return () => window.removeEventListener("cartUpdated", fetchCart);
  }, []);

  const removeFromCart = async (id) => {
    const token = localStorage.getItem("authToken"); // FIXED
    if (!token) {
      setCartItems(cartItems.filter((i) => i.id !== id));
      return;
    }

    try {
      await fetch(`${API}/cart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const removeItem = (id) => setItemToRemove(id);
  const handleConfirmRemove = () => {
    removeFromCart(itemToRemove);
    setItemToRemove(null);
  };
  const handleCancelRemove = () => setItemToRemove(null);

  const deliveryFee = cartItems.length > 0 ? 10000 : 0;
  const getSubtotal = () => cartItems.reduce((sum, item) => sum + item.price * 1, 0);
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
    const token = localStorage.getItem("authToken"); // FIXED

    if (!token) {
      alert("Please log in to complete checkout.");
      return;
    }

    try {
      // ✅ Create backend order
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

      // Clear cart properly using DELETE /cart/{item}
      for (const item of cartItems) {
        await fetch(`${API}/cart/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchCart(); // refresh cart

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

    try {
      await fetch(`${API}/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  if (loading) return <p>Loading cart...</p>;


  return (
    <section className={styles.cartPage}>

      <h2 className={styles.yourCart}>Your Cart</h2>

      <div className={styles.cartLayout}>
        {/* Cart Items Section */}
        <section className={styles.cartSection}>
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
                      <strong className={styles.itemTitle}>{item.brand} | {item.model || item.name}</strong>
                      <span className={styles.itemSize}>Size: {item.case_size || 'N/A'}</span>
                      <span className={styles.itemPrice}>₱{item.price.toLocaleString()}</span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => removeItem(item.id)} // This now calls the updated function
                      title="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                  </li>
                ); 
              })} 
            </ul>
          ) : (
            <p className={styles.emptyCart}>Your cart is empty.</p>
          )}
        </section>

        {/* --- (Checkout Summary Section is unchanged) --- */}
        {cartItems.length > 0 && (
          <section className={styles.checkoutSection}>
            <h3 className={styles.orderSummary}>Order Summary</h3>
            <div className={styles.summaryDetails}>
              {/* ...summary details... */}
              <p><span>Subtotal</span> <span>₱{getSubtotal().toLocaleString()}</span></p>
              <p>
                <span>Discount ({(discountRate * 100).toFixed(0)}%)</span>
                <span className={styles.discountAmount}>-₱{getDiscount().toLocaleString()}</span>
              </p>
              <p><span>Delivery Fee</span> <span>₱{deliveryFee.toLocaleString()}</span></p>
              <hr className={styles.summaryDivider} />
              <p className={styles.totalAmount}><strong>Total</strong> <strong>₱{getTotal().toLocaleString()}</strong></p>
              {/* ...promo section... */}
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
              {/* ...order button... */}
              <button
                type="button"
                className={styles.orderBtn}
                onClick={() => setShowForm(true)}
              >
                Go to Checkout
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </section>
        )}
      </div>

      {/* --- (Checkout Form Modal is unchanged) --- */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {/* ...form content... */}
            <h2>Checkout Details</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Full Name
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                Complete Address
                <input type="text" name="address" value={form.address} onChange={handleChange} required />
              </label>
              <label>
                Contact Number
                <input type="tel" name="contact" value={form.contact} onChange={handleChange} required />
              </label>
              <label>
                Mode of Payment
                <select name="payment" value={form.payment} onChange={handleChange} required >
                  <option value="">Select Payment Method</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="GCash">GCash</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </label>

              <div className={styles.modalButtons}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>
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

      {/* 5. ADD THE NEW DELETE CONFIRMATION MODAL */}
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