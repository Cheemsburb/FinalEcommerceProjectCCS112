import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../pages/styles/Admin.module.css';

export default function AdminNav() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? `${styles.adminNavLink} ${styles.activeLink}` : styles.adminNavLink;

    return (
        <div className={styles.adminNav}>
            <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>Overview</Link>
            <Link to="/admin/products" className={isActive('/admin/products')}>Products</Link>
            <Link to="/admin/users" className={isActive('/admin/users')}>Users</Link>
            <Link to="/admin/orders" className={isActive('/admin/orders')}>Orders</Link>
        </div>
    );
}