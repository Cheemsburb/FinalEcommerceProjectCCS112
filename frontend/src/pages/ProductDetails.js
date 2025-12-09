import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./styles/ProductDetails.module.css";
import ReviewCard from "../components/ReviewCard";
import ProductCard from "../components/ProductCard"; 
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

function ProductDetails({ addToCart, token, currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("42mm");
  const [message, setMessage] = useState("");

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewDescription, setNewReviewDescription] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const userExistingReview = product?.reviews?.find(
    (review) => review.user_id === currentUser?.id
  );
  const hasUserReviewed = !!userExistingReview;

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      const data = await res.json();
      setProduct(data);
      if (data && data.case_size) setSelectedSize(data.case_size);

      const allRes = await fetch(`http://localhost:8000/api/products`);
      if (allRes.ok) {
        const allData = await allRes.json();
        const suggestions = allData
            .filter(item => item.id !== parseInt(id))
            .slice(0, 4);
        setRelatedProducts(suggestions);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      alert("Please log in to add items to your cart.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!product) return;
    const success = await addToCart(product, selectedSize);
    if (success) {
      setMessage("Product added to cart!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      alert("Please log in to buy items.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!product) return;
    const success = await addToCart(product, selectedSize);
    if (success) navigate("/cart");
  };

  const handleWriteReviewClick = () => {
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (hasUserReviewed) {
      alert("You have already reviewed this product.");
      return;
    }
    setShowReviewForm(true);
  };

  const handleSubmitReview = async () => {
    if (!token) return;
    if (!newReviewDescription.trim()) {
      alert("Please write a description.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: newReviewRating,
          description: newReviewDescription
        })
      });

      if (response.ok) {
        alert("Review submitted successfully!");
        setShowReviewForm(false);
        setNewReviewDescription("");
        setNewReviewRating(5);
        fetchProductData(); 
      } else {
        const errorData = await response.json();
        alert("Failed to submit review: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Review submission error:", error);
      alert("An error occurred while submitting your review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;
  if (error || !product) return <div className={styles.loading}>Error: {error || "Product not found"}</div>;

  const imagePath = images[product.image_link] || images[product.image] || product.image_link || product.image || "";

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Check stock status
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className={styles.detailsPage}>
      {message && <div className={styles.toast}>{message}</div>}

      <div className={styles.topSection}>
        <div
          className={styles.mainImage}
          style={{
            backgroundImage: `url(${imagePath})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className={styles.info}>
          <h2>{product.model}</h2>
          <div className={styles.rating}>
            <div className={styles.starsWrapper}>{renderStars(product.star_review)}</div>
            <span className={styles.ratingText}>{product.star_review}/5</span>
          </div>
          <p className={styles.price}>₱{Number(product.price).toLocaleString()}</p>
          
          {/* Stock Display */}
          {isOutOfStock ? (
             <p style={{ color: "red", fontWeight: "bold", marginTop: "10px" }}>Out of Stock</p>
          ) : (
             <p style={{ color: "green", marginTop: "10px" }}>{product.stock_quantity} items left</p>
          )}

          <p className={styles.descriptionText}>{product.description}</p>

          <div className={styles.sizeSelection}>
            <p className={styles.sizeTitle}>Choose Size</p>
            <div className={styles.sizeOptions}>
              {["40mm", "41mm", "42mm"].map((size) => (
                <button
                  key={size}
                  className={`${styles.sizeButton} ${selectedSize === size ? styles.selected : ""}`}
                  onClick={() => setSelectedSize(size)}
                  disabled={isOutOfStock} // Disable size selection if out of stock
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttons}>
            <button 
              className={styles.addToCart} 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={isOutOfStock ? { backgroundColor: '#ccc', cursor: 'not-allowed', color: '#666' } : {}}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button 
              className={styles.buyNowBtn} 
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              style={isOutOfStock ? { backgroundColor: '#ccc', cursor: 'not-allowed', color: '#666', border: 'none' } : {}}
            >
              {isOutOfStock ? "Unavailable" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.reviewsContainer}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>
              Rating & Reviews ({product.reviews ? product.reviews.length : 0})
            </h2>
            {hasUserReviewed ? (
               <span style={{ color: "#666", fontSize: "0.95rem", fontStyle: "italic" }}>
                 You have already reviewed this product.
               </span>
            ) : (
               <button className={styles.writeReviewBtn} onClick={handleWriteReviewClick}>
                 Write a Review
               </button>
            )}
          </div>

          {showReviewForm && !hasUserReviewed && (
            <div className={styles.reviewForm}>
               <h4>Write your review</h4>
               <div className={styles.formGroup}>
                 <label>Rating</label>
                 <select 
                    className={styles.reviewSelect}
                    value={newReviewRating} 
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                 >
                   <option value="5">5 Stars - Excellent</option>
                   <option value="4">4 Stars - Good</option>
                   <option value="3">3 Stars - Average</option>
                   <option value="2">2 Stars - Poor</option>
                   <option value="1">1 Star - Terrible</option>
                 </select>
               </div>
               <div className={styles.formGroup}>
                 <label>Review</label>
                 <textarea 
                    className={styles.reviewTextarea}
                    placeholder="Tell us about your experience..."
                    value={newReviewDescription}
                    onChange={(e) => setNewReviewDescription(e.target.value)}
                 />
               </div>
               <div className={styles.formActions}>
                  <button 
                    className={styles.submitReviewBtn}
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  <button 
                    className={styles.cancelReviewBtn}
                    onClick={() => setShowReviewForm(false)} 
                  >
                    Cancel
                  </button>
               </div>
            </div>
          )}

          <div className={styles.reviewsGrid}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  name={`${review.user?.first_name || "Anonymous"} ${review.user?.last_name || ""}`}
                  rating={review.rating}
                  comment={review.description}
                  date={formatDate(review.created_at)}
                />
              ))
            ) : (
              <p>No reviews yet. Be the first to write one!</p>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
            <div className={styles.relatedHeader}>
                <h2>You Might Also Like</h2>
            </div>
            <div className={styles.relatedGrid}>
                {relatedProducts.map(item => (
                    <ProductCard 
                        key={item.id} 
                        {...item} 
                        addToCart={addToCart} 
                        token={token} 
                    />
                ))}
            </div>
        </div>
      )}
      
    </div>
  );
}

export default ProductDetails;