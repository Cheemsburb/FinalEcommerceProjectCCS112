import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/ProductCard.module.css";
import images from "../assets/imageLoader"; // Import the loader

// Helper function to render star icons based on a rating score
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

function ProductCard({ id, model, brand, star_review, price, image_link }) {
  const imageSrc = images[image_link];
  const [imageError, setImageError] = useState(false);
  const showPlaceholder = !imageSrc || imageError;

  return (
    <div className={styles.card}>
      <Link to={`/products/${id}`} className={styles.cardLink}>
        <div className={styles.imageContainer}>
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