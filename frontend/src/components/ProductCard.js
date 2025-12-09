import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/ProductCard.module.css";
import images from "../assets/imageLoader"; 

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={i < fullStars ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    );
  }
  return stars;
};

// Added stock_quantity to props
function ProductCard({ id, model, brand, star_review, price, image_link, stock_quantity }) {
  const imageSrc = images[image_link];
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !imageSrc || imageError;

  const isOutOfStock = stock_quantity <= 0;

  return (
    <div className={styles.card} style={isOutOfStock ? { opacity: 0.8 } : {}}>
      <Link to={`/products/${id}`} className={styles.cardLink}>
        <div className={styles.imageContainer} style={{ position: 'relative' }}>
          
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10, color: '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem',
              border: '1px solid #ddd'
            }}>
              OUT OF STOCK
            </div>
          )}

          {!showPlaceholder ? (
            <img
              src={imageSrc}
              alt={model}
              className={styles.productImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <p>Details</p>
            </div>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.brand}>{brand}</p>
          <h3 className={styles.productName}>{model}</h3>
          <div className={styles.rating}>
            <div className={styles.starsWrapper}>{renderStars(star_review)}</div>
            <span className={styles.ratingText}>{star_review}/5</span>
          </div>
          <p className={styles.price}>
            {new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP'
            }).format(Number(price))}
          </p>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;