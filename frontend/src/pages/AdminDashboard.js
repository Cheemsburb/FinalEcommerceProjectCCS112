import React, { useState, useEffect } from 'react';
import styles from './styles/Admin.module.css';
import AdminNav from '../components/AdminNav';

const API = "http://localhost:8000/api";

export default function AdminDashboard({ token }) {
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_orders: 0,
        total_users: 0,
        total_products: 0,
        low_stock_count: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API}/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    setStats(await res.json());
                }
            } catch (error) {
                console.error("Error fetching stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [token]);

    return (
        <div className={styles.adminContainer}>
            <AdminNav />
            
            <header className={styles.adminHeader}>
                <h1>Dashboard Overview</h1>
            </header>

            {loading ? <p>Loading stats...</p> : (
                <div className={styles.statGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Revenue</span>
                        <span className={styles.statValue}>₱{Number(stats.total_revenue).toLocaleString()}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Orders</span>
                        <span className={styles.statValue}>{stats.total_orders}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Active Customers</span>
                        <span className={styles.statValue}>{stats.total_users}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Products</span>
                        <span className={styles.statValue}>{stats.total_products}</span>
                    </div>
                    {stats.low_stock_count > 0 && (
                        <div className={styles.statCard} style={{ borderColor: '#fee2e2', backgroundColor: '#fff5f5' }}>
                            <span className={`${styles.statLabel} ${styles.statHighlight}`}>Low Stock Alerts</span>
                            <span className={`${styles.statValue} ${styles.statHighlight}`}>{stats.low_stock_count}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}