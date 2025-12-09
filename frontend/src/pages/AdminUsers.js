import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/Admin.module.css';
import AdminNav from '../components/AdminNav';

const API = "http://localhost:8000/api";

export default function AdminUsers({ token }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '', 
        confirmPassword: '', 
        role: 'customer'
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
           
            const response = await fetch(`${API}/users?t=${Date.now()}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            }); 
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error("Error fetching users");
            }
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        
        const config = {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            }
        };

        try {
            let response;
            
            if (isEditing) {
                
                const { password, confirmPassword, ...updateData } = formData; 
                const payload = password ? { ...updateData, password } : updateData;
                
                response = await fetch(`${API}/users/${formData.id}`, {
                    method: 'PUT',
                    headers: config.headers,
                    body: JSON.stringify(payload)
                });
            } else {
                
                const registerPayload = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone_number: formData.phone_number,
                    password: formData.password,
                    password_confirmation: formData.confirmPassword, 
                    role: formData.role
                };
                
                
                response = await fetch(`${API}/register`, {
                    method: 'POST',
                    headers: config.headers,
                    body: JSON.stringify(registerPayload)
                });
            }

            if (response.ok) {
                alert(isEditing ? 'User Updated Successfully' : 'User Created Successfully');
                closeModal();
                fetchUsers();
            } else {
                const errorData = await response.json();
                
                const msg = errorData.message || JSON.stringify(errorData.errors) || "Unknown error";
                alert("Failed to save user: " + msg);
            }
        } catch (error) {
            console.error("Error saving user", error);
            alert("Failed to save user.");
        }
    };

    const handleEdit = (user) => {
        setIsEditing(true);
        
        setFormData({ 
            ...user, 
            phone_number: user.phone_number || '', 
            password: '', 
            confirmPassword: '' 
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? Deleting a user will cascade delete their orders and reviews.')) return;
        try {
            const response = await fetch(`${API}/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                fetchUsers();
            } else {
                alert("Failed to delete user.");
            }
        } catch (error) {
            console.error("Error deleting user", error);
            alert("Failed to delete user.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setFormData(initialFormState);
    };

    return (
        <div className={styles.adminContainer}>
            <AdminNav />

            <header className={styles.adminHeader}>
                <h1>User Management</h1>
                <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => setIsModalOpen(true)}>
                    + Add New User
                </button>
            </header>

            <div className={styles.tableContainer}>
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Joined</th>
                            <th className={styles.textRight}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className={styles.textCenter}>Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="6" className={styles.textCenter}>No users found.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatarCircle}>
                                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={styles.fontBold}>{user.first_name} {user.last_name}</div>
                                                <div className={styles.textMuted}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : styles.roleCustomer}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{user.phone_number || <span className={styles.textMuted}>-</span>}</td>
                                    <td className={styles.textMuted}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className={styles.textRight}>
                                        <button onClick={() => handleEdit(user)} className={styles.btnLink}>Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className={`${styles.btnLink} ${styles.btnLinkDanger}`}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modalContent} ${styles.modalSm}`}>
                        <div className={styles.modalHeader}>
                            <h3>{isEditing ? 'Edit User' : 'Add New User'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className={styles.adminForm}>
                            <div className={styles.formRow}>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>First Name</label>
                                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                </div>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Last Name</label>
                                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Phone Number</label>
                                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
                            </div>

                            <div className={styles.formRow}>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Password {isEditing && <span className={styles.small}>(Optional)</span>}</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        required={!isEditing} 
                                    />
                                </div>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Confirm Password</label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        required={!isEditing || formData.password.length > 0} 
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Role</label>
                                <select name="role" value={formData.role} onChange={handleChange}>
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`}>
                                    {isEditing ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}