import React, { useState, useEffect, useCallback } from "react";
import style from "./styles/Profile.module.css";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const navigate = useNavigate();
    const apiToken = localStorage.getItem("apiToken");

   
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null); // null = Add New, Object = Edit
    const [modalForm, setModalForm] = useState({ address: "", state: "", zip_code: "" });

   
    const makeAuthRequest = useCallback(async (url, method = "GET", body = null) => {
        if (!apiToken) {
            navigate("/login");
            return null;
        }

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        };

        try {
            const response = await fetch(`http://localhost:8000/api${url}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("apiToken");
                navigate("/login");
                return null;
            }

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            if (response.status === 204) return true;

            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            return null;
        }
    }, [apiToken, navigate]);

   
    const loadUserProfile = useCallback(async () => {
        const userData = await makeAuthRequest("/user", "GET");
        if (userData) {
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            setEmail(userData.email || "");
            setPhoneNumber(userData.phone_number || "");
        }
    }, [makeAuthRequest]);

    const loadAddresses = useCallback(async () => {
        const data = await makeAuthRequest("/addresses", "GET");
        if (data && Array.isArray(data)) {
            setAddresses(data);
        } else {
            setAddresses([]);
        }
    }, [makeAuthRequest]);

    const loadOrders = useCallback(async () => {
        const data = await makeAuthRequest("/orders", "GET");
        if (!data) {
            setOrders([]);
            return;
        }

        const normalizeItem = (item) => {
            const qty = Number(item.quantity ?? item.pivot?.quantity ?? 1);
            const unitPrice = Number(item.price_at_purchase ?? item.product?.price ?? 0);
            return { ...item, quantity: qty, price_at_purchase: unitPrice };
        };

        const normalizedOrders = (Array.isArray(data) ? data : []).map(order => {
            const items = Array.isArray(order.items) ? order.items.map(normalizeItem) : [];
            const calculatedTotal = items.reduce((s, it) => s + (it.price_at_purchase * it.quantity), 0);
            return { ...order, items, order_subtotal: calculatedTotal };
        });

        setOrders(normalizedOrders);
    }, [makeAuthRequest]);

    useEffect(() => {
        if (!apiToken) return navigate("/login");
        const init = async () => {
            setIsLoading(true);
            await Promise.all([loadUserProfile(), loadAddresses(), loadOrders()]);
            setIsLoading(false);
        };
        init();
    }, [apiToken, navigate, loadUserProfile, loadAddresses, loadOrders]);

 
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) return alert("Passwords do not match!");

        const profilePayload = { first_name: firstName, last_name: lastName, phone_number: phoneNumber };
        
        
        if (newPassword) {
            profilePayload.password = newPassword;
            profilePayload.password_confirmation = confirmPassword; 
        }
        
        const res = await makeAuthRequest("/user", "PUT", profilePayload);
        if (res) {
            alert("Profile Info Updated!");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    
    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Delete this address?")) return;
        const success = await makeAuthRequest(`/addresses/${id}`, "DELETE");
        if (success) loadAddresses();
    };

    const handleSetDefault = async (id) => {
        const res = await makeAuthRequest(`/addresses/${id}/set-default`, "PATCH");
        if (res) loadAddresses();
    };

    
    const openAddModal = () => {
        setEditingAddress(null);
        setModalForm({ address: "", state: "", zip_code: "" });
        setIsAddressModalOpen(true);
    };

    const openEditModal = (addr) => {
        setEditingAddress(addr);
        setModalForm({ address: addr.address, state: addr.state, zip_code: addr.zip_code });
        setIsAddressModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        let res;
        if (editingAddress) {
            res = await makeAuthRequest(`/addresses/${editingAddress.id}`, "PUT", modalForm);
        } else {
            res = await makeAuthRequest("/addresses", "POST", modalForm);
        }

        if (res) {
            setIsAddressModalOpen(false);
            loadAddresses();
        } else {
            alert("Failed to save address.");
        }
    };

    if (isLoading) return <div className={style.loadingState}>Loading profile...</div>;

    return (
        <div className={style.profileContainer}>
            {/* LEFT COLUMN */}
            <div className={style.leftColumn}>
                
                {/* 1. PERSONAL INFO FORM */}
                <form onSubmit={handleSaveProfile} className={style.cardSection}>
                    <div className={style.sectionHeader}>
                        <h2 className={style.sectionTitle}>Personal Information</h2>
                    </div>
                    <div className={style.formGrid}>
                        <div className={style.formGroup}>
                            <label>First Name</label>
                            <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div className={style.formGroup}>
                            <label>Last Name</label>
                            <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                        <div className={style.formGroup}>
                            <label>Email</label>
                            <input disabled type="email" value={email} className={style.inputDisabled} />
                        </div>
                        <div className={style.formGroup}>
                            <label>Phone</label>
                            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className={style.passwordSection}>
                        <h3 className={style.subTitle}>Change Password <span className={style.optional}>(Optional)</span></h3>
                        <div className={style.formGrid}>
                            <div className={style.formGroup}>
                                <input placeholder="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <div className={style.formGroup}>
                                <input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className={style.btnPrimary} style={{ marginTop: '20px' }}>Update Profile</button>
                </form>

                {/* 2. ADDRESS MANAGEMENT (READ ONLY CARDS) */}
                <div className={style.cardSection}>
                    <div className={style.sectionHeader}>
                        <h2 className={style.sectionTitle}>My Addresses</h2>
                        <button type="button" className={style.btnAddSmall} onClick={openAddModal}>+ Add New</button>
                    </div>

                    <div className={style.addressGrid}>
                        {addresses.length === 0 && <p className={style.emptyText}>No addresses saved yet.</p>}
                        
                        {addresses.map((addr) => (
                            <div key={addr.id} className={`${style.addressCard} ${addr.is_default ? style.defaultCard : ''}`}>
                                
                                {/* FIX: Add '!!' before addr.is_default to prevent rendering '0' */}
                                {!!addr.is_default && <span className={style.defaultBadge}>Default</span>}
                                
                                <div className={style.addressContent}>
                                    <p className={style.addrTextMain}>{addr.address}</p>
                                    <p className={style.addrTextSub}>{addr.state}, {addr.zip_code}</p>
                                </div>

                                <div className={style.addressActions}>
                                    <div className={style.actionLeft}>
                                        <button onClick={() => openEditModal(addr)} className={style.btnAction}>Edit</button>
                                        {!addr.is_default && (
                                            <>
                                                <span className={style.divider}>|</span>
                                                <button onClick={() => handleSetDefault(addr.id)} className={style.btnAction}>Set Default</button>
                                            </>
                                        )}
                                    </div>
                                    <button onClick={() => handleDeleteAddress(addr.id)} className={style.btnDeleteIcon} title="Delete">&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: ORDERS */}
            <div className={style.rightColumn}>
                <h2 className={style.sectionTitle}>Order History</h2>
                <div className={style.orderList}>
                    {orders.length === 0 ? (
                        <div className={style.emptyState}>
                            <p>No orders placed yet.</p>
                            <button onClick={() => navigate('/products')} className={style.btnSecondary}>Start Shopping</button>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className={style.orderCard}>
                                <div className={style.orderHeader}>
                                    <div>
                                        <span className={style.orderId}>Order #{order.id}</span>
                                        <span className={style.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className={style.orderMetaRight}>
                                        <span className={`${style.statusBadge} ${style[order.status] || style.pending}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                        <span className={style.orderTotal}>₱{Number(order.total_amount).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={style.orderItems}>
                                    {order.items.map((item, i) => (
                                        <div key={i} className={style.orderItem}>
                                            <div className={style.itemInfo}>
                                                <span className={style.itemBrand}>{item.product?.brand}</span>
                                                <span className={style.itemModel}>{item.product?.model}</span>
                                                <span className={style.itemMeta}>Qty: {item.quantity}</span>
                                            </div>
                                            <span className={style.itemPrice}>
                                                ₱{(Number(item.price_at_purchase) * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ADDRESS MODAL */}
            {isAddressModalOpen && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.modalHeader}>
                            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                            <button className={style.closeBtn} onClick={() => setIsAddressModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleModalSubmit}>
                            <div className={style.formGroup}>
                                <label>Street Address</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={modalForm.address} 
                                    onChange={(e) => setModalForm({...modalForm, address: e.target.value})} 
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div className={style.formGrid}>
                                <div className={style.formGroup}>
                                    <label>State / City</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={modalForm.state} 
                                        onChange={(e) => setModalForm({...modalForm, state: e.target.value})} 
                                    />
                                </div>
                                <div className={style.formGroup}>
                                    <label>Zip Code</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={modalForm.zip_code} 
                                        onChange={(e) => setModalForm({...modalForm, zip_code: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className={style.modalActions}>
                                <button type="button" onClick={() => setIsAddressModalOpen(false)} className={style.btnSecondary}>Cancel</button>
                                <button type="submit" className={style.btnPrimary}>{editingAddress ? 'Save Changes' : 'Add Address'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}