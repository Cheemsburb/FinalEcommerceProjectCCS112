import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/Admin.module.css'; 
import images from '../assets/imageLoader'; 
import AdminNav from '../components/AdminNav';

const API = "http://localhost:8000/api";

export default function AdminProducts({ token }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        id: '', 
        model: '',
        brand: '',
        price: '',
        stock_quantity: 10,
        image_link: '',
        description: '',
        category: '', 
        case_size: '',
        star_review: 0
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchProducts();
    }, [token]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare categories array
        const processedCategory = typeof formData.category === 'string' 
            ? formData.category.split(',').map(cat => cat.trim()).filter(cat => cat !== '')
            : formData.category;

        const config = { 
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            } 
        };

        try {
            let response;
            if (isEditing) {
                // Update: Include everything
                const payload = { ...formData, category: processedCategory };
                response = await fetch(`${API}/products/${formData.id}`, {
                    method: 'PUT',
                    headers: config.headers,
                    body: JSON.stringify(payload)
                });
            } else {
                // Create: Exclude 'id' so backend generates it automatically
                const { id, ...createData } = formData;
                const payload = { ...createData, category: processedCategory };
                
                response = await fetch(`${API}/products`, {
                    method: 'POST',
                    headers: config.headers,
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                alert(isEditing ? 'Product Updated Successfully' : 'Product Created Successfully');
                closeModal();
                fetchProducts();
            } else {
                const err = await response.json();
                alert("Failed to save product. " + (err.message || ""));
            }
        } catch (error) {
            console.error("Error saving product", error);
            alert("Failed to save product.");
        }
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setFormData({
            ...product,
            category: Array.isArray(product.category) ? product.category.join(', ') : product.category
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const response = await fetch(`${API}/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                fetchProducts();
            } else {
                alert("Failed to delete product.");
            }
        } catch (error) {
            console.error("Error deleting product", error);
            alert("Failed to delete product.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setFormData(initialFormState);
    };

    const getProductImage = (imageLink) => {
        if (!imageLink) return null;
        if (imageLink.startsWith('http')) return imageLink;
        return images[imageLink] || null; 
    };

    return (
        <div className={styles.adminContainer}>
            <AdminNav />

            <header className={styles.adminHeader}>
                <h1>Product Inventory</h1>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsModalOpen(true)}>
                    + Add New Product
                </button>
            </header>

            <div className={styles.tableContainer}>
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Details</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th className={styles.textRight}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className={styles.textCenter}>Loading products...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan="6" className={styles.textCenter}>No products found.</td></tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id}>
                                    <td className={styles.skuCell}>#{product.id}</td>
                                    <td>
                                        <div className={styles.productInfo}>
                                            <div className={styles.imageWrapper}>
                                              {product.image_link ? (
                                                  <img 
                                                    className={styles.productThumb} 
                                                    src={getProductImage(product.image_link)} 
                                                    alt="" 
                                                    onError={(e) => e.target.style.display='none'} 
                                                  />
                                              ) : (
                                                  <div className={styles.productThumbPlaceholder}>No Img</div>
                                              )}
                                            </div>
                                            <div>
                                                <div className={styles.fontBold}>{product.brand}</div>
                                                <div className={styles.textMuted}>{product.model}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.tagContainer}>
                                            {Array.isArray(product.category) && product.category.map((cat, idx) => (
                                                <span key={idx} className={styles.tag}>{cat}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>₱{Number(product.price).toLocaleString()}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${product.stock_quantity > 5 ? styles.statusSuccess : styles.statusDanger}`}>
                                            {product.stock_quantity} Left
                                        </span>
                                    </td>
                                    <td className={styles.textRight}>
                                        <button onClick={() => handleEdit(product)} className={styles.btnLink}>Edit</button>
                                        <button onClick={() => handleDelete(product.id)} className={`${styles.btnLink} ${styles.btnLinkDanger}`}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className={styles.adminForm}>
                            <div className={styles.formRow}>
                                {/* ID Input Removed */}
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Brand</label>
                                    <select name="brand" value={formData.brand} onChange={handleChange} required>
                                        <option value="">Select Brand</option>
                                        <option value="Rolex">Rolex</option>
                                        <option value="Omega">Omega</option>
                                        <option value="Seiko">Seiko</option>
                                        <option value="Richard Mille">Richard Mille</option>
                                        <option value="Casio">Casio</option>
                                    </select>
                                </div>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Model</label>
                                    <input type="text" name="model" value={formData.model} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Price</label>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Stock Quantity</label>
                                    <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Case Size</label>
                                    <input type="text" name="case_size" value={formData.case_size} onChange={handleChange} placeholder="42mm" />
                                </div>
                                <div className={`${styles.formGroup} ${styles.halfWidth}`}>
                                    <label>Image Filename</label>
                                    <input type="text" name="image_link" value={formData.image_link} onChange={handleChange} placeholder="image-name.png" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Categories (Comma separated)</label>
                                <input 
                                    type="text" 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    placeholder="Men's, Sportswear, Formal"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={closeModal} className={`${styles.btn} ${styles.btnSecondary}`}>Cancel</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                    {isEditing ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}