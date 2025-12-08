import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import styles from "./styles/CartCheckout.module.css";
import images from "../assets/imageLoader";

const API = "http://localhost:8000/api";

function CartCheckout({ cartItems, setCartItems, removeFromCart, clearCart, token }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
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

  const fetchCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await fetch(`${API}/addresses`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      
      setAddresses(Array.isArray(data) ? data : []);
      const defaultAddr = data.find(addr => addr.is_default) || data[0];
      if (defaultAddr) setForm(prev => ({ ...prev, address_id: defaultAddr.id }));
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setAddresses([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      alert("Please log in to access the cart.");
      navigate("/login");
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [token, navigate, fetchCart, fetchAddresses]);

  const removeItem = (id) => setItemToRemove(id);

  const handleConfirmRemove = async () => {
    if (itemToRemove) {
      await removeFromCart(itemToRemove);
      setItemToRemove(null);
      fetchCart();
    }
  };

  const handleCancelRemove = () => setItemToRemove(null);

  const deliveryFee = cartItems.length > 0 ? 10000 : 0;

  const getSubtotal = () => cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const getDiscount = () => Math.round(getSubtotal() * discountRate);
  const getTotal = () => getSubtotal() - getDiscount() + deliveryFee;

  const showMessage = (msg, status) => {
    setPromoMessage(msg);
    setPromoStatus(status);
    setTimeout(() => { setPromoMessage(""); setPromoStatus(""); }, 3000);
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (promoApplied) { showMessage("Promo code already used.", "error"); return; }
    if (code === "WTCH.CO") { setDiscountRate(0.1); setPromoApplied(true); showMessage("10% Discount Applied!", "success"); }
    else showMessage("Invalid promo code.", "error");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Persist cart item quantity change to server (adjust endpoint/method if your API differs)
  const updateCartItemOnServer = useCallback(async (cartItemId, quantity) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API}/cart/${cartItemId}`, {
        method: "PUT", // change to PATCH if backend expects
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart item quantity on server");
      return true;
    } catch (err) {
      console.error("Error updating cart item on server:", err);
      return false;
    }
  }, [token]);

  const handleQuantityChange = async (cartItemId, value) => {
    const qty = Math.max(1, Number(value) || 1);

    // optimistic UI update
    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: qty } : item
      )
    );

    // persist change, rollback on failure
    const ok = await updateCartItemOnServer(cartItemId, qty);
    if (!ok) {
      await fetchCart();
      showMessage("Failed to update quantity on server.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let shippingAddressId = form.address_id;
    if (!token) { alert("Authentication required for checkout. Please log in."); navigate("/login"); return; }
    if (!shippingAddressId) { alert("Please select a shipping address."); return; }

    if (shippingAddressId === "new") {
      if (!form.new_address || !form.new_state || !form.new_zip_code) {
        alert("Please fill in all new address fields.");
        return;
      }
      try {
        const res = await fetch(`${API}/addresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ address: form.new_address, state: form.new_state, zip_code: form.new_zip_code }),
        });
        if (!res.ok) throw new Error("Failed to save new address");
        const data = await res.json();
        shippingAddressId = data.id;
        fetchAddresses();
      } catch (err) {
        console.error(err);
        alert("Error saving new address. Please try again.");
        return;
      }
    }

    try {
      // build items payload with product_id, quantity and unit price (price_at_purchase)
      const itemsPayload = cartItems.map(i => ({
        product_id: i.product_id,
        quantity: Number(i.quantity || 1),
        price_at_purchase: Number(i.price || 0),
      }));

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shipping_address_id: shippingAddressId,
          billing_address_id: shippingAddressId,
          items: itemsPayload,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Checkout failed due to server error.");
      }
      if (clearCart) await clearCart();

      setShowForm(false);
      setForm({ name: "", address_id: "", payment: "", new_address: "", new_state: "", new_zip_code: "", contact_number: "" });
      setPromoCode(""); setPromoApplied(false); setDiscountRate(0); setPromoMessage(""); setPromoStatus("");

      alert("Checkout successful! Your order has been placed.");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(`Error processing your order: ${err.message || "Please try again."}`);
    }
  };

  if (loading) return <p>Loading cart...</p>;

  return (
    <section className={styles.cartPage}>
      <h2 className={styles.yourCart}>Your Cart</h2>
      <div className={styles.cartLayout}>
        <section className={styles.cartSection}>
          {cartItems.length > 0 ? (
            <ul className={styles.cartList}>
              {cartItems.map((item) => {
                const imageSrc = images[item.image_link] || "";
                return (
                  <li key={item.cartItemId} className={styles.cartItem}>
                    <img src={imageSrc} alt={item.model} className={styles.productImage} />
                    <div className={styles.itemDetails}>
                      <strong className={styles.itemTitle}>{item.brand} | {item.model}</strong>
                      <span className={styles.itemSize}>Size: {item.case_size || "N/A"}</span>

                      <div className={styles.quantityWrapper}>
                        <label>
                          Quantity
                          <div className={styles.quantityControls}>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.cartItemId, (item.quantity || 1) - 1)}
                            >-</button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity || 1}
                              onChange={(e) => handleQuantityChange(item.cartItemId, e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.cartItemId, (item.quantity || 1) + 1)}
                            >+</button>
                          </div>
                        </label>
                      </div>

                      <span className={styles.itemPrice}>₱{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                    </div>

                    <button className={styles.deleteBtn} onClick={() => setItemToRemove(item.cartItemId)} aria-label="Remove item" title="Remove item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.emptyState}>
              <h3>Your cart is empty.</h3>
              <p>Start exploring watches and add items to your cart. Your cart items will appear here.</p>
              <button className={styles.shopBtn} onClick={() => navigate("/products")}>Shop Now</button>
            </div>
          )}
        </section>

        {cartItems.length > 0 && (
          <section className={styles.checkoutSection}>
            <h3 className={styles.orderSummary}>Order Summary</h3>
            <div className={styles.summaryDetails}>
              <p><span>Subtotal</span><span>₱{getSubtotal().toLocaleString()}</span></p>
              <p><span>Discount ({(discountRate * 100).toFixed(0)}%)</span><span className={styles.discountAmount}>-₱{getDiscount().toLocaleString()}</span></p>
              <p><span>Delivery Fee</span><span>₱{deliveryFee.toLocaleString()}</span></p>
              <hr className={styles.summaryDivider} />
              <p className={styles.totalAmount}><strong>Total</strong><strong>₱{getTotal().toLocaleString()}</strong></p>

              <div className={styles.promoSection}>
                <input
                  className={`${styles.promoInput} ${promoStatus === "success" ? styles.success : promoStatus === "error" ? styles.error : ""}`}
                  type="text"
                  placeholder="Add promo code"
                  value={promoMessage || promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); if (promoMessage) { setPromoMessage(""); setPromoStatus(""); } }}
                  disabled={promoApplied}
                  aria-label="Promo Code"
                />
                <button type="button" className={styles.applyBtn} onClick={applyPromo} disabled={promoApplied}>{promoApplied ? "Applied" : "Apply"}</button>
              </div>

              <button type="button" className={styles.orderBtn} onClick={() => setShowForm(true)}>Go to Checkout</button>
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
              <label>Full Name<input type="text" name="name" value={form.name} onChange={handleChange} required /></label>
              <label>Shipping Address
                <select name="address_id" value={form.address_id} onChange={handleChange} required>
                  <option value="">Select Address</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>{addr.address}, {addr.state}, {addr.zip_code} {addr.is_default && "(Default)"}</option>
                  ))}
                  <option value="new">Add New Address</option>
                </select>
              </label>
              {form.address_id === "new" && (
                <>
                  <label>Address<input type="text" name="new_address" value={form.new_address} onChange={handleChange} required /></label>
                  <label>State<input type="text" name="new_state" value={form.new_state} onChange={handleChange} required /></label>
                  <label>Zip Code<input type="text" name="new_zip_code" value={form.new_zip_code} onChange={handleChange} required /></label>
                </>
              )}
              <label>Contact Number<input type="text" name="contact_number" value={form.contact_number} onChange={handleChange} required /></label>
              <label>Mode of Payment
                <select name="payment" value={form.payment} onChange={handleChange} required>
                  <option value="">Select Payment Method</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="GCash">GCash</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </label>
              <div className={styles.modalButtons}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className={styles.confirmBtn}>Confirm Order</button>
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
            <p className={styles.confirmText}>Are you sure you want to remove this item from your cart?</p>
            <div className={styles.confirmButtons}>
              <button type="button" className={styles.confirmBtnSecondary} onClick={handleCancelRemove}>Cancel</button>
              <button type="button" className={styles.confirmBtnPrimary} onClick={handleConfirmRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartCheckout;