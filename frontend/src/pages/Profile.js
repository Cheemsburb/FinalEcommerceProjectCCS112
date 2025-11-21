import React, { useState } from 'react';
import style from "./styles/Profile.module.css";

function Profile() {

    // Profile states
    const [firstName, setFirstName] = useState('Peter');
    const [lastName, setLastName] = useState('Ducker');
    const [email, setEmail] = useState('peterducker312@gmail.com');
    const [phone, setPhone] = useState('(+1) - 234 - 687215421');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Multiple addresses
    const [addresses, setAddresses] = useState([
        { shippingAddress: "", state: "", zipCode: "" }
    ]);

    const addAddress = () => {
        setAddresses([...addresses, { shippingAddress: "", state: "", zipCode: "" }]);
    };

    const updateAddress = (index, field, value) => {
        const updated = [...addresses];
        updated[index][field] = value;
        setAddresses(updated);
    };

    const removeAddress = (index) => {
        const updated = addresses.filter((_, i) => i !== index);
        setAddresses(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Saving changes:", {
            firstName,
            lastName,
            email,
            phone,
            newPassword,
            confirmPassword,
            addresses
        });
    };

    return (
        <div className={style.profileContainer}>
            <form onSubmit={handleSubmit}>

                {/* Profile Information */}
                <h2 className={style.sectionTitle}>Profile Information</h2>
                <div className={style.formGrid}>
                    <div className={style.formGroup}>
                        <label htmlFor="firstName">First name</label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className={style.formGroup}>
                        <label htmlFor="lastName">Last name</label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className={style.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={style.formGroup}>
                        <label>Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>

                {/* Change Password */}
                <h2 className={style.sectionTitle}>Change Password</h2>
                <div className={style.formGrid}>
                    <div className={style.formGroup}>
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className={style.formGroup}>
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* Addresses */}
                <h2 className={style.sectionTitle}>Address</h2>
                {addresses.map((addr, index) => (
                    <div key={index} className={style.addressBlock}>
                        <div className={style.formGrid}>
                            <div className={`${style.formGroup} ${style.spanFull}`}>
                                <label>Shipping Address</label>
                                <textarea
                                    rows="4"
                                    value={addr.shippingAddress}
                                    onChange={(e) => updateAddress(index, "shippingAddress", e.target.value)}
                                ></textarea>
                            </div>
                            <div className={style.formGroup}>
                                <label>State</label>
                                <input
                                    type="text"
                                    value={addr.state}
                                    onChange={(e) => updateAddress(index, "state", e.target.value)}
                                    placeholder="Your state"
                                />
                            </div>
                            <div className={style.formGroup}>
                                <label>Zip Code</label>
                                <input
                                    type="text"
                                    value={addr.zipCode}
                                    onChange={(e) => updateAddress(index, "zipCode", e.target.value)}
                                    placeholder="Your zip code"
                                />
                            </div>
                        </div>

                        {/* Delete button for this address */}
                        {addresses.length > 1 && (
                            <button
                                type="button"
                                className={style.deleteAddressBtn}
                                onClick={() => removeAddress(index)}
                            >
                                Delete Address
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addAddress}
                    className={style.addAddressBtn}
                >
                    + Add Another Address
                </button>

                {/* Save Button */}
                <button type="submit" className={style.saveButton}>
                    Save Changes
                </button>

            </form>
        </div>
    );
}

export default Profile;
