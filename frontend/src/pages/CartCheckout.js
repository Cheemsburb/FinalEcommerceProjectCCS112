import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import styles from "./styles/CartCheckout.module.css";
import images from "../assets/imageLoader"; // Assumed path for product images

// Define your API base URL
const API = "http://localhost:8000/api";

function CartCheckout({ cartItems, setCartItems, removeFromCart, clearCart, token }) {
  const navigate = useNavigate();

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  const [form, setForm] = useState({
    name: "", // User's full name
    address_id: "", // ID of the selected address OR "new"
    payment: "", // Selected payment method
    new_address: "",
    new_state: "",
    new_zip_code: "",
    contact_number: "", // Contact number for the order
  });

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountRate, setDiscountRate] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // --- API Request Handlers ---

  // Utility function to fetch user's cart (GET /cart)
  const fetchCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();

      // Map the product details nested inside cart_items table row
      const formattedCart = Array.isArray(data.items)
        ? data.items.map((c) => ({
            cartItemId: c.id, // This is the {cartItem} ID for PUT/DELETE
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

  // Utility function to fetch user's addresses (GET /addresses)
  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      
      setAddresses(Array.isArray(data) ? data : []);

      // Find default address to pre-select it
      const defaultAddr = data.find(addr => addr.is_default) || data[0];
      if (defaultAddr) {
        setForm(prev => ({ ...prev, address_id: defaultAddr.id }));
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setAddresses([]);
    }
  }, [token]);

  // Fetch data on component mount/token change
  useEffect(() => {
    if (!token) {
      // Using token prop for check to prevent double-navigation
      alert("Please log in to access the cart.");
      navigate("/login");
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [token, navigate, fetchCart, fetchAddresses]);

  // Update quantity (PUT /cart/{cartItem})
  const handleQuantityChange = async (cartItemId, quantity) => {
    if (!token || quantity < 1) return;
    try {
      const res = await fetch(`${API}/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      
      // Refresh cart to show updated total and quantity
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("Error updating quantity.");
    }
  };

  // Remove item modal handlers
  const removeItem = (id) => {
    setItemToRemove(id);
  };

  const handleConfirmRemove = async () => {
    if (itemToRemove) {
      // This calls the parent's removeFromCart, which should handle the API DELETE /cart/{cartItem}
      await removeFromCart(itemToRemove);
      setItemToRemove(null);
      fetchCart(); // Refresh cart list
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
      setDiscountRate(0.1); // 10%
      setPromoApplied(true);
      showMessage("10% Discount Applied!", "success");
    } else {
      showMessage("Invalid promo code.", "error");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Main Checkout Handler (POST /orders) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    let shippingAddressId = form.address_id;

    if (!token) {
      alert("Authentication required for checkout. Please log in.");
      navigate("/login");
      return;
    }

    if (!shippingAddressId) {
      alert("Please select a shipping address.");
      return;
    }
    
    // 1. If 'Add New Address' is selected, save it first (POST /addresses)
    if (shippingAddressId === "new") {
      if (!form.new_address || !form.new_state || !form.new_zip_code) {
        alert("Please fill in all new address fields (Address, State, Zip Code).");
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
        shippingAddressId = data.id; // Use the new ID for checkout
        fetchAddresses(); // Refresh the list
      } catch (err) {
        console.error(err);
        alert("Error saving new address. Please try again.");
        return;
      }
    }

    // 2. Create the order (POST /orders)
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipping_address_id: shippingAddressId,
          billing_address_id: shippingAddressId, // Assuming billing is same as shipping
          // NOTE: Promo code handling logic is complex and best handled by the backend.
          // Since the API payload doesn't explicitly mention 'promo_code', we omit it here 
          // but the provided code snippet includes it. I will keep it commented for API conformity.
          // promo_code: promoApplied ? promoCode : null, 
        }),
      });
      
      if (!res.ok) {
        // If the API returns a response that isn't okay, try to read the error message
        const errorData = await res.json();
        throw new Error(errorData.message || "Checkout failed due to server error.");
    }
    
    // Clear cart and refresh frontend
    if (clearCart) await clearCart(); // Clear cart (client-side)

    // Reset local state
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
    setPromoMessage("");
    setPromoStatus("");

    // Inform user and redirect to profile
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
                            handleQuantityChange(item.cartItemId, Number(e.target.value))
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
            <p className={styles.emptyCart}>Your cart is empty.</p>
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
                  className={`${styles.promoInput} ${promoStatus === "success" ? styles.success : promoStatus === "error" ? styles.error : ""}`}
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
                  aria-label="Promo Code"
                />
                <button type="button" className={styles.applyBtn} onClick={applyPromo} disabled={promoApplied}>
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
                <input type="text" name="name" value={form.name} onChange={handleChange} required />
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
                      {addr.address}, {addr.state}, {addr.zip_code} {addr.is_default && "(Default)"}
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
                <select name="payment" value={form.payment} onChange={handleChange} required>
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
              <button type="button" className={styles.confirmBtnSecondary} onClick={handleCancelRemove}>
                Cancel
              </button>
              <button type="button" className={styles.confirmBtnPrimary} onClick={handleConfirmRemove}>
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