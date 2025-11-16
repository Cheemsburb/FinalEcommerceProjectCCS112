import React, { useState } from 'react';
import style from "./styles/Profile.module.css";


function Profile() {
    // States for the editable form fields
    const [lastName, setLastName] = useState('Ducker');
    const [newPassword, setNewPassword] = useState('••••••••••••');
    const [confirmPassword, setConfirmPassword] = useState('••••••••••••');
    const [shippingAddress, setShippingAddress] = useState('Your address');
    const [userState, setUserState] = useState('');
    const [zipCode, setZipCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle logic to save changes
        console.log("Saving changes:", {
            lastName,
            newPassword,
            confirmPassword,
            shippingAddress,
            userState,
            zipCode
        });
    };

    return (
        <div className={style.profileContainer}>
            <form onSubmit={handleSubmit}>

                {/* --- Profile Information --- */}
                <h2 className={style.sectionTitle}>Profile Information</h2>
                <div className={style.formGrid}>
                    <div className={style.formGroup}>
                        <label htmlFor="firstName">First name</label>
                        <input
                            type="text"
                            id="firstName"
                            value="Peter"
                            readOnly
                            className={style.readOnly}
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
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value="peterducker312@gmail.com"
                            readOnly
                            className={style.readOnly}
                        />
                    </div>
                    <div className={style.formGroup}>
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            value="(+1) - 234 - 687215421"
                            readOnly
                            className={style.readOnly}
                        />
                    </div>
                </div>

                {/* --- Change Password --- */}
                <h2 className={style.sectionTitle}>Change Password</h2>
                <div className={style.formGrid}>
                    <div className={style.formGroup}>
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className={style.formGroup}>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- Address --- */}
                <h2 className={style.sectionTitle}>Address</h2>
                <div className={style.formGrid}>
                    <div className={`${style.formGroup} ${style.spanFull}`}>
                        <label htmlFor="shippingAddress">Shipping address</label>
                        <textarea
                            id="shippingAddress"
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            rows="4"
                        ></textarea>
                    </div>
                    <div className={style.formGroup}>
                        <label htmlFor="state">State</label>
                        <input
                            type="text"
                            id="state"
                            value={userState}
                            onChange={(e) => setUserState(e.target.value)}
                            placeholder="Your state"
                        />
                    </div>
                    <div className={style.formGroup}>
                        <label htmlFor="zipCode">Zip Code</label>
                        <input
                            type="text"
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="Your zip code"
                        />
                    </div>
                </div>

                {/* --- Save Button --- */}
                <button type="submit" className={style.saveButton}>
                    Save Changes
                </button>

            </form>
        </div>
    );
}

export default Profile;