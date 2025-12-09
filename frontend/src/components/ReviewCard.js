import React from 'react';
import styles from './styles/ReviewCard.module.css';


const renderStars = (rating) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>
        ★
      </span>
    );
  }
  return stars;
};

function ReviewCard({ name, rating, comment, date }) {
  return (
    <div className={styles.reviewCard}>
      <div className={styles.rating}>{renderStars(rating)}</div>
      <p className={styles.name}>{name}</p>
      <p className={styles.comment}>"{comment}"</p>
      <p className={styles.date}>Posted on {date}</p>
    </div>
  );
}

export default ReviewCard;