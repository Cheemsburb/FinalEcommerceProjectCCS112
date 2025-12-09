import React, { useState, useEffect } from 'react';
import styles from './styles/Admin.module.css';
import AdminNav from '../components/AdminNav';

const API = "http://localhost:8000/api";

export default function AdminOrders({ token }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API}/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) {
                // Optimistic update
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            alert("Error updating status");
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return '#fbbf24'; // yellow
            case 'shipped': return '#3b82f6'; // blue
            case 'delivered': return '#10b981'; // green
            case 'cancelled': return '#ef4444'; // red
            default: return '#9ca3af';
        }
    };

    return (
        <div className={styles.adminContainer}>
            <AdminNav />
            <header className={styles.adminHeader}>
                <h1>Order Management</h1>
            </header>

            <div className={styles.tableContainer}>
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="6" className={styles.textCenter}>Loading...</td></tr> : 
                         orders.length === 0 ? <tr><td colSpan="6" className={styles.textCenter}>No orders found.</td></tr> :
                         orders.map(order => (
                            <tr key={order.id}>
                                <td className={styles.skuCell}>#{order.id}</td>
                                <td>
                                    <div className={styles.fontBold}>
                                        {order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Unknown User'}
                                    </div>
                                    <div className={styles.textMuted}>{order.user?.email}</div>
                                </td>
                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td>₱{Number(order.total_amount).toLocaleString()}</td>
                                <td>
                                    <span style={{ 
                                        color: getStatusColor(order.status), 
                                        fontWeight: 'bold', 
                                        textTransform: 'uppercase', 
                                        fontSize: '0.8rem' 
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    <select 
                                        className={styles.statusSelect} 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}