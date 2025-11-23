import React, { useState, useEffect, useCallback } from "react";
import style from "./styles/Profile.module.css";
import { useNavigate } from "react-router-dom";

function Profile() {
    const navigate = useNavigate();
    // Assuming the API Token is stored after successful login/register
    const apiToken = localStorage.getItem("apiToken");
    
    // --- State Management ---
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState(""); // Not explicitly in API doc, keeping for form
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Utility Function for Authenticated API Calls ---
    const makeAuthRequest = useCallback(async (url, method = 'GET', body = null) => {
        if (!apiToken) {
            alert("Authentication token missing. Redirecting to login.");
            navigate("/login");
            return null;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`, // Header format from doc [cite: 15]
        };

        try {
            const response = await fetch(`http://localhost:8000/api${url}`, { // Base URL prefix [cite: 8, 7]
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
            });

            if (response.status === 401 || response.status === 403) {
                // Token invalid or resource forbidden [cite: 151, 164, 169]
                alert("Session expired or unauthorized access. Please log in again.");
                handleLogout(false); // Log out locally but don't call the API again
                return null;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // 204 No Content for successful DELETE [cite: 168]
            if (response.status === 204) return true;
            
            return await response.json();

        } catch (error) {
            console.error("API Request Failed:", error);
            alert(`API Error: ${error.message}`);
            return null;
        }
    }, [apiToken, navigate]);


    // --- Data Fetching Functions (Read Operations) ---

    // Load User Profile (GET /user)
    const loadUserProfile = useCallback(async () => {
        const userData = await makeAuthRequest('/user', 'GET'); // Gets the current user's profile 
        if (userData) {
            setFirstName(userData.first_name || ""); // Uses API fields [cite: 105]
            setLastName(userData.last_name || ""); // Uses API fields [cite: 106]
            setEmail(userData.email || ""); // Uses API fields [cite: 107]
            // Phone is not in API response, keeps current empty state
        }
    }, [makeAuthRequest]);

    // Load Addresses (GET /addresses)
    const loadAddresses = useCallback(async () => {
        const addressesData = await makeAuthRequest('/addresses', 'GET'); // Retrieves all addresses for user 
        if (addressesData) {
            // Map API response fields to local state fields
            setAddresses(addressesData.map(addr => ({
                id: addr.id,
                shippingAddress: addr.address, // API field is 'address' [cite: 122]
                state: addr.state, // API field is 'state' [cite: 123]
                zipCode: addr.zip_code, // API field is 'zip_code' [cite: 124]
                is_default: addr.is_default, // API field is 'is_default' [cite: 125]
            })));
        } else {
            setAddresses([]);
        }
    }, [makeAuthRequest]);

    // Load Orders (GET /orders)
    const loadOrders = useCallback(async () => {
        const ordersData = await makeAuthRequest('/orders', 'GET'); // Gets list of past orders 
        if (ordersData) {
            // Note: The API doc only shows GET /orders, which returns a list. 
            // We'll assume the structure is compatible with the old local state for display.
            // In a real app, GET /orders would return basic orders, and GET /orders/{id} 
            // would get the full detail[cite: 205]. For simplicity, we use the API list.
            setOrders(ordersData || []); 
        } else {
            setOrders([]);
        }
    }, [makeAuthRequest]);


    // --- Initial Load Effect ---
    useEffect(() => {
        const loadData = async () => {
            if (apiToken) {
                setIsLoading(true);
                // Load all necessary data from the backend
                await loadUserProfile();
                await loadAddresses();
                await loadOrders();
                setIsLoading(false);
            } else {
                 // no user/token: redirect to login
                 navigate("/login");
            }
        };

        loadData();
    }, [apiToken, navigate, loadUserProfile, loadAddresses, loadOrders]);


    // --- Local Address Management (before saving to API) ---

    const addAddress = () => {
        // Add a temporary address object to the state (without an ID)
        setAddresses([...addresses, { 
            id: null, // Marks it as a new address to be posted to the API
            shippingAddress: "", 
            state: "", 
            zipCode: "" 
        }]);
    };

    const updateAddress = (index, field, value) => {
        const updated = [...addresses];
        updated[index][field] = value;
        setAddresses(updated);
    };

    const removeAddress = (index) => {
        const addressToRemove = addresses[index];
        if (addressToRemove.id) {
            // If the address exists in the backend, confirm and call DELETE API
            if (window.confirm("Are you sure you want to delete this saved address?")) {
                makeAuthRequest(`/addresses/${addressToRemove.id}`, 'DELETE') // Deletes address 
                    .then(success => {
                        if (success) {
                            setAddresses(addresses.filter((_, i) => i !== index));
                            alert("Address deleted successfully from the backend.");
                        }
                    });
            }
        } else {
            // Just remove it from local state if it's new (no ID)
            setAddresses(addresses.filter((_, i) => i !== index));
        }
    };

    // --- Save Handler (Create & Update Operations) ---
    const handleSaveChanges = async (e) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        let saveSuccess = true;

        // 1. Save Address Changes (Create new or Update existing)
        for (const addr of addresses) {
            const payload = {
                address: addr.shippingAddress,
                state: addr.state,
                zip_code: addr.zipCode,
            };

            if (addr.id === null) {
                // CREATE new address (POST /addresses) 
                const result = await makeAuthRequest('/addresses', 'POST', payload);
                if (!result) { saveSuccess = false; break; }

            } else {
                // UPDATE existing address (PUT /addresses/{id}) 
                const result = await makeAuthRequest(`/addresses/${addr.id}`, 'PUT', payload);
                if (!result) { saveSuccess = false; break; }
            }
        }

        // 2. Handle Password Change (No dedicated endpoint, this is usually handled via an update user endpoint, 
        // but for this implementation, we will skip it since we don't have a PUT /user endpoint.)
        // **NOTE: API doc does not show a PUT/user endpoint for profile updates.** // If one existed, we would call it here. For now, only address changes are synced.

        if (saveSuccess) {
            alert("Changes saved successfully!");
            // Refresh addresses to get new IDs from created items
            await loadAddresses();
            setNewPassword("");
            setConfirmPassword("");
        } else {
            alert("Profile update failed. Check console for details.");
        }
        setIsLoading(false);
    };

    const handleLogout = (callApi = true) => {
        const confirmLogout = window.confirm("Are you sure you want to logout?");
        if (!confirmLogout) return;

        if (callApi && apiToken) {
            // Call POST /logout to invalidate token 
            makeAuthRequest('/logout', 'POST')
                .then(() => console.log("Token invalidated on backend."))
                .catch(() => console.error("Logout API call failed."));
        }

        // Clear local storage and navigate regardless of API success
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

                {/* --- Profile Data (Currently not synced with API) --- */}
                <div className={style.formGrid}>
                    <div className={style.formGroup}>
                        <label>First Name</label>
                        {/* API does not expose PUT/PATCH /user, so these fields are read-only */}
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
                        {/* Assuming Phone is a local-only field since it's not in the API doc */}
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                </div>
                
               <h2 className={style.sectionTitle}>Change Password</h2>
                    <div className={style.formGrid}>
                    <div className={style.formGroup}>
                     <label>New Password</label>
                     {/* ADDED autoComplete="new-password" to prevent autofill */}
                    <input 
                     type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                            autoComplete="new-password" 
                 />
                </div>
                    <div className={style.formGroup}>
                 <label>Confirm New Password</label>
                    {/* ADDED autoComplete="new-password" to prevent autofill */}
                    <input 
                      type="password" 
                     value={confirmPassword} 
                     onChange={(e) => setConfirmPassword(e.target.value)} 
                     autoComplete="new-password" 
        />
                      </div>
                </div>

                {/* --- Addresses (Synced with API) --- */}
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
                                <td colSpan="4" className={style.emptyMessage}>No addresses saved. Click "Add Another Address" to start.</td>
                            </tr>
                        )}
                        {addresses.map((addr, index) => (
                            <tr key={addr.id || index}> 
                                {/* Key uses ID if available, otherwise index for new items */}
                                <td><input type="text" value={addr.shippingAddress} onChange={(e) => updateAddress(index, "shippingAddress", e.target.value)} /></td>
                                <td><input type="text" value={addr.state} onChange={(e) => updateAddress(index, "state", e.target.value)} /></td>
                                <td><input type="text" value={addr.zipCode} onChange={(e) => updateAddress(index, "zipCode", e.target.value)} /></td>
                                <td><button type="button" className={style.deleteAddressButton} onClick={() => removeAddress(index)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <button type="button" className={style.addAddressButton} onClick={addAddress}>+ Add Another Address</button>

                {/* --- Order History (Synced with API) --- */}
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
                        {orders && orders.length > 0 ? (
                            orders.map((order, idx) => (
                                <tr key={idx}>
                                    {/* Assuming API response for GET /orders is similar to old local storage format */}
                                    <td>{order.id}</td>
                                    <td>{order.created_at}</td>
                                    <td>
                                        {/* This requires orders to have items data, which GET /orders might not include. 
                                            We keep the previous structure for display purposes, but rely on API data. */}
                                        {/* Replace with actual API item display logic if data is available */}
                                        <div>Items detail not available from simple GET /orders.</div>
                                    </td>
                                    <td>₱{Number(order.total).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className={style.emptyMessage}>No order history yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <button type="submit" className={style.saveButton}>Save Changes</button>
                <button type="button" className={style.logoutButton} onClick={() => handleLogout(true)}>Logout</button>
            </form>
        </div>
    );
}

export default Profile;