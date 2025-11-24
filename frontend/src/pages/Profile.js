import React, { useState, useEffect, useCallback } from "react";
import style from "./styles/Profile.module.css";
import { useNavigate } from "react-router-dom";

function Profile() {
    const navigate = useNavigate();
    const apiToken = localStorage.getItem("apiToken");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const makeAuthRequest = useCallback(async (url, method = "GET", body = null) => {
        if (!apiToken) {
            alert("Authentication token missing. Redirecting to login.");
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
                alert("Session expired or unauthorized access. Please log in again.");
                handleLogout(false);
                return null;
            }

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            if (response.status === 204) return true;

            return await response.json();
        } catch (error) {
            console.error("API Request Failed:", error);
            alert(`API Error: ${error.message}`);
            return null;
        }
    }, [apiToken, navigate]);

    const loadUserProfile = useCallback(async () => {
        const userData = await makeAuthRequest("/user", "GET");
        if (userData) {
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            setEmail(userData.email || "");
        }
    }, [makeAuthRequest]);

    const loadAddresses = useCallback(async () => {
        const addressesData = await makeAuthRequest("/addresses", "GET");
        if (addressesData) {
            setAddresses(
                addressesData.map((addr) => ({
                    id: addr.id,
                    shippingAddress: addr.address,
                    state: addr.state,
                    zipCode: addr.zip_code,
                    is_default: addr.is_default,
                }))
            );
        } else {
            setAddresses([]);
        }
    }, [makeAuthRequest]);

    const loadOrders = useCallback(async () => {
        const ordersData = await makeAuthRequest("/orders", "GET");
        if (ordersData) {
            setOrders(ordersData || []);
        } else {
            setOrders([]);
        }
    }, [makeAuthRequest]);

    useEffect(() => {
        const loadData = async () => {
            if (apiToken) {
                setIsLoading(true);
                await loadUserProfile();
                await loadAddresses();
                await loadOrders();
                setIsLoading(false);
            } else {
                navigate("/login");
            }
        };
        loadData();
    }, [apiToken, navigate, loadUserProfile, loadAddresses, loadOrders]);

    const addAddress = () => {
        setAddresses([...addresses, { id: null, shippingAddress: "", state: "", zipCode: "" }]);
    };

    const updateAddress = (index, field, value) => {
        const updated = [...addresses];
        updated[index][field] = value;
        setAddresses(updated);
    };

    const removeAddress = (index) => {
        const addressToRemove = addresses[index];
        if (addressToRemove.id) {
            if (window.confirm("Are you sure you want to delete this saved address?")) {
                makeAuthRequest(`/addresses/${addressToRemove.id}`, "DELETE").then(
                    (success) => {
                        if (success) {
                            setAddresses(addresses.filter((_, i) => i !== index));
                            alert("Address deleted successfully.");
                        }
                    }
                );
            }
        } else {
            setAddresses(addresses.filter((_, i) => i !== index));
        }
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        let saveSuccess = true;

        for (const addr of addresses) {
            const payload = {
                address: addr.shippingAddress,
                state: addr.state,
                zip_code: addr.zipCode,
            };

            if (addr.id === null) {
                const result = await makeAuthRequest("/addresses", "POST", payload);
                if (!result) {
                    saveSuccess = false;
                    break;
                }
            } else {
                const result = await makeAuthRequest(`/addresses/${addr.id}`, "PUT", payload);
                if (!result) {
                    saveSuccess = false;
                    break;
                }
            }
        }

        if (saveSuccess) {
            alert("Changes saved successfully!");
            await loadAddresses();
            setNewPassword("");
            setConfirmPassword("");
        } else {
            alert("Profile update failed.");
        }

        setIsLoading(false);
    };

    const handleLogout = (callApi = true) => {
        const confirmLogout = window.confirm("Are you sure you want to logout?");
        if (!confirmLogout) return;

        if (callApi && apiToken) {
            makeAuthRequest("/logout", "POST");
        }

        localStorage.removeItem("apiToken");
        navigate("/login");
    };

    if (isLoading) {
        return <div className={style.profileContainer}>Loading profile data...</div>;
    }

    return (
        <div className={style.profileContainer}>
            <form onSubmit={handleSaveChanges}>
                <h2 className={style.sectionTitle}>Profile Information</h2>

                <div className={style.formGrid}>
                    <div className={style.formGroup}>
                        <label>First Name</label>
                        <input type="text" value={firstName} readOnly />
                    </div>

                    <div className={style.formGroup}>
                        <label>Last Name</label>
                        <input type="text" value={lastName} readOnly />
                    </div>

                    <div className={style.formGroup}>
                        <label>Email</label>
                        <input type="email" value={email} readOnly />
                    </div>

                    <div className={style.formGroup}>
                        <label>Phone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                <h2 className={style.sectionTitle}>Change Password</h2>

                <div className={style.formGrid}>
                    <div className={style.formGroup}>
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={style.formGroup}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <h2 className={style.sectionTitle}>Addresses</h2>

                <table className={style.addressTable}>
                    <thead>
                        <tr>
                            <th>Shipping Address</th>
                            <th>State</th>
                            <th>Zip Code</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addresses.length === 0 && (
                            <tr>
                                <td colSpan="4" className={style.emptyMessage}>
                                    No addresses saved. Click "Add Another Address" to start.
                                </td>
                            </tr>
                        )}

                        {addresses.map((addr, index) => (
                            <tr key={addr.id || index}>
                                <td>
                                    <input
                                        type="text"
                                        value={addr.shippingAddress}
                                        onChange={(e) =>
                                            updateAddress(index, "shippingAddress", e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={addr.state}
                                        onChange={(e) =>
                                            updateAddress(index, "state", e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={addr.zipCode}
                                        onChange={(e) =>
                                            updateAddress(index, "zipCode", e.target.value)
                                        }
                                    />
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className={style.deleteAddressButton}
                                        onClick={() => removeAddress(index)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button
                    type="button"
                    className={style.addAddressButton}
                    onClick={addAddress}
                >
                    + Add Another Address
                </button>

                <h2 className={style.sectionTitle}>Order History</h2>

                <table className={style.orderTable}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order, idx) => (
                                <tr key={idx}>
                                    <td>{order.id}</td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>

                                    <td>
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item, i) => (
                                                <div key={i}>
                                                    Product ID: {item.product_id} x {item.quantity} — ₱
                                                    {Number(item.price_at_purchase).toLocaleString()}
                                                </div>
                                            ))
                                        ) : (
                                            <div>No items available</div>
                                        )}
                                    </td>

                                    <td>
                                        {order.items && order.items.length > 0
                                            ? "₱" +
                                              order.items
                                                  .reduce(
                                                      (sum, item) =>
                                                          sum +
                                                          Number(item.price_at_purchase) *
                                                              Number(item.quantity),
                                                      0
                                                  )
                                                  .toLocaleString()
                                            : "₱0"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className={style.emptyMessage}>
                                    No order history yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <button type="submit" className={style.saveButton}>
                    Save Changes
                </button>

                <button
                    type="button"
                    className={style.logoutButton}
                    onClick={() => handleLogout(true)}
                >
                    Logout
                </button>
            </form>
        </div>
    );
}

export default Profile;
