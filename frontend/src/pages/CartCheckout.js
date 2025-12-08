import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/CartCheckout.module.css";
import images from "../assets/imageLoader";

// Define your API base URL
const API = "http://localhost:8000/api";

function CartCheckout({
  cartItems,
  setCartItems,
  removeFromCart,
  clearCart,
  token,
}) {
  const navigate = useNavigate();

  // Ref to prevent double-firing the redirect logic
  const navigatedToLogin = useRef(false);

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });

  const [form, setForm] = useState({
    name: "",
    address_id: "",
    payment: "",
    new_address: "",
    new_state: "",
    new_zip_code: "",
    contact_number: "",
  });

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountRate, setDiscountRate] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  /**
   * Shows a temporary notification to the user.
   */
  const showUserNotification = (message, type = "info") => {
    setNotification({ message, type });
    // Note: We don't auto-clear here if we are redirecting,
    // but the component unmounting will handle it.
  };

  // --- API Request Handlers ---

  const fetchCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();

      const formattedCart = Array.isArray(data.items)
        ? data.items.map((c) => ({
            cartItemId: c.id,
            product_id: c.product?.id,
            brand: c.product?.brand,
            model: c.product?.model,
            price: Number(c.product?.price),
            image_link: c.product?.image_link,
            case_size: c.product?.case_size,
            quantity: c.quantity,
          }))
        : [];

      setCartItems(formattedCart);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, setCartItems]);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();

      setAddresses(Array.isArray(data) ? data : []);

      const defaultAddr = data.find((addr) => addr.is_default) || data[0];
      if (defaultAddr) {
        setForm((prev) => ({ ...prev, address_id: defaultAddr.id }));
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setAddresses([]);
    }
  }, [token]);

  // --- AUTH CHECK & DATA FETCHING ---
  useEffect(() => {
    // 1. Check if user is logged in
    if (!token) {
      // If not logged in, and we haven't started the redirect process yet:
      if (!navigatedToLogin.current) {
        navigatedToLogin.current = true;

        // Stop loading so the UI (and notification) can render
        setLoading(false);

        // Show the Custom Notification
        showUserNotification("Please login to access your cart.", "error");

        // Wait 1.5 seconds so the user sees the message, then redirect
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
      return;
    }

    // 2. If logged in, proceed to fetch data
    navigatedToLogin.current = false;
    fetchCart();
    fetchAddresses();
  }, [token, navigate, fetchCart, fetchAddresses]);

  // Update quantity
  const handleQuantityChange = async (cartItemId, quantity) => {
    const newQuantity = Number(quantity);
    if (!token || newQuantity < 1) return;

    try {
      const res = await fetch(`${API}/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");

      fetchCart();
    } catch (err) {
      console.error(err);
      showUserNotification("Error updating quantity.", "error");
    }
  };

  // Remove item handlers
  const removeItem = (id) => {
    setItemToRemove(id);
  };

  const handleConfirmRemove = async () => {
    if (itemToRemove) {
      await removeFromCart(itemToRemove);
      setItemToRemove(null);
      fetchCart();
      showUserNotification("Item successfully removed from cart.", "success");
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    }
  };

  const handleCancelRemove = () => setItemToRemove(null);

  // --- Calculations ---
  const deliveryFee = cartItems.length > 0 ? 10000 : 0;

  const getSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getDiscount = () => Math.round(getSubtotal() * discountRate);

  const getTotal = () => getSubtotal() - getDiscount() + deliveryFee;

  // --- Promo Logic ---
  const showPromoMessage = (msg, status) => {
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
      showPromoMessage("Promo code already used.", "error");
      return;
    }
    if (code === "WTCH.CO") {
      setDiscountRate(0.1); // 10%
      setPromoApplied(true);
      showPromoMessage("10% Discount Applied!", "success");
    } else {
      showPromoMessage("Invalid promo code.", "error");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Main Checkout Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    let shippingAddressId = form.address_id;

    if (!token) {
      navigate("/login");
      return;
    }

    if (!shippingAddressId) {
      showUserNotification("Please select a shipping address.", "error");
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
      return;
    }

    // 1. If 'Add New Address' is selected, save it first
    if (shippingAddressId === "new") {
      if (!form.new_address || !form.new_state || !form.new_zip_code) {
        showUserNotification("Please fill in all new address fields.", "error");
        setTimeout(() => setNotification({ message: "", type: "" }), 3000);
        return;
      }
      try {
        const res = await fetch(`${API}/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            address: form.new_address,
            state: form.new_state,
            zip_code: form.new_zip_code,
          }),
        });
        if (!res.ok) throw new Error("Failed to save new address");
        const data = await res.json();
        shippingAddressId = data.id;
        fetchAddresses();
      } catch (err) {
        console.error(err);
        showUserNotification("Error saving new address.", "error");
        setTimeout(() => setNotification({ message: "", type: "" }), 3000);
        return;
      }
    }

    // 2. Create the order
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address_id: shippingAddressId,
          billing_address_id: shippingAddressId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Checkout failed.");
      }

      if (clearCart) await clearCart();

      setShowForm(false);
      setForm({
        name: "",
        address_id: "",
        payment: "",
        new_address: "",
        new_state: "",
        new_zip_code: "",
        contact_number: "",
      });
      setPromoCode("");
      setPromoApplied(false);
      setDiscountRate(0);

      showUserNotification("Checkout successful!", "success");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error(err);
      showUserNotification(`Error processing order: ${err.message}`, "error");
      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    }
  };

  // Conditional render for loading
  // NOTE: If token is missing, we set loading to false in useEffect so the notification renders.
  if (loading) return <p style={{ padding: "20px" }}>Loading cart...</p>;

  return (
    <section className={styles.cartPage}>
      {/* Notification Component - Renders Custom Popup */}
      {notification.message && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <h2 className={styles.yourCart}>Your Cart</h2>
      <div className={styles.cartLayout}>
        <section className={styles.cartSection}>
          {cartItems.length > 0 ? (
            <ul className={styles.cartList}>
              {cartItems.map((item) => {
                const imageSrc = images[item.image_link] || "";
                return (
                  <li key={item.cartItemId} className={styles.cartItem}>
                    <img
                      src={imageSrc}
                      alt={item.model}
                      className={styles.productImage}
                    />
                    <div className={styles.itemDetails}>
                      <strong className={styles.itemTitle}>
                        {item.brand} | {item.model}
                      </strong>
                      <span className={styles.itemSize}>
                        Size: {item.case_size || "N/A"}
                      </span>
                      <span className={styles.itemPrice}>
                        ₱{item.price.toLocaleString()}
                      </span>
                      <div className={styles.quantityWrapper}>
                        Quantity:
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.cartItemId,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setItemToRemove(item.cartItemId)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            // If user is not logged in, cart is empty, but notification will show above
            <p className={styles.emptyCart}>
              {!token ? "Redirecting to login..." : "Your cart is empty."}
            </p>
          )}
        </section>

        {/* Order Summary */}
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
                  value={promoMessage || promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    if (promoMessage) {
                      setPromoMessage("");
                      setPromoStatus("");
                    }
                  }}
                  disabled={promoApplied}
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

      {/* Checkout Modal */}
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
                Shipping Address
                <select
                  name="address_id"
                  value={form.address_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Address</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.address}, {addr.state}, {addr.zip_code}{" "}
                      {addr.is_default && "(Default)"}
                    </option>
                  ))}
                  <option value="new">Add New Address</option>
                </select>
              </label>

              {form.address_id === "new" && (
                <>
                  <label>
                    Address
                    <input
                      type="text"
                      name="new_address"
                      value={form.new_address}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    State
                    <input
                      type="text"
                      name="new_state"
                      value={form.new_state}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    Zip Code
                    <input
                      type="text"
                      name="new_zip_code"
                      value={form.new_zip_code}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </>
              )}

              <label>
                Contact Number
                <input
                  type="text"
                  name="contact_number"
                  value={form.contact_number}
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

      {/* Remove Item Modal */}
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
