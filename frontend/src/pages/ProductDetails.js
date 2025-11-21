import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./styles/ProductDetails.module.css";
import ProductCard from "../components/ProductCard";
import ReviewCard from "../components/ReviewCard";
import images from "../assets/imageLoader"; 

// Sample review data (kept static for now until you fetch real reviews)
const sampleReviews = [
  { id: 1, name: "Correllene I.", rating: 5, comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", date: "October 1, 2025" },
  { id: 2, name: "Josua R.", rating: 4, comment: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", date: "October 3, 2025" },
  { id: 3, name: "Ira S.", rating: 5, comment: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", date: "October 2, 2025" },
  { id: 4, name: "Aljake R.", rating: 4, comment: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", date: "October 4, 2025" },
  { id: 5, name: "Benedic S.", rating: 5, comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", date: "October 5, 2025" },
  { id: 6, name: "Gladwyn S.", rating: 4, comment: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", date: "October 6, 2025" }
];

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

// 1. ACCEPT TOKEN AS PROP
function ProductDetails({ addToCart, token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [message, setMessage] = useState("");
  const [selectedSize, setSelectedSize] = useState("42mm");
  const [isMobile, setIsMobile] = useState(false);
  
  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewDescription, setNewReviewDescription] = useState(""); // Using 'description' based on docs
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Single Product
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        setProduct(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // --- 2. TOKEN CHECK LOGIC (USING PROP) ---
  const handleWriteReviewClick = () => {
    // Check if token prop exists (User is logged in)
    if (token) {
      setShowReviewForm(true);
    } else {
      // User is NOT logged in -> Redirect to Login
      navigate("/login", { state: { from: location.pathname } });
    }
  };

  // --- 3. SUBMIT REVIEW LOGIC (MATCHING DOCS) ---
  const handleSubmitReview = async () => {
    if (!token) {
      alert("You must be logged in to submit a review.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!newReviewDescription.trim()) {
      alert("Please write a description.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      // 4. SEND POST REQUEST
      const response = await fetch(`http://localhost:8000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Use the token prop here
        },
        body: JSON.stringify({
          rating: newReviewRating,
          description: newReviewDescription // Matches PDF Documentation
        })
      });

      if (response.ok) {
        alert("Review submitted successfully!");
        setShowReviewForm(false);
        setNewReviewDescription("");
        // Optional: You could re-fetch reviews here to show the new one immediately
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

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      model: product.model,
      brand: product.brand,
      price: product.price,
      star_review: product.star_review,
      image: product.image_link,
      quantity: 1,
      size: selectedSize,
    });
    setMessage("Product added to cart!");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/cart");
  };

  if (isLoading) return <div className={styles.loading}>Loading product details...</div>;
  if (error || !product) return <div className={styles.loading}>Error: {error || "Product not found"}</div>;

  const imagePath = images[product.image_link] || product.image_link;
  const suggestions = []; 
  const reviewsToShow = isMobile ? sampleReviews.slice(0, 3) : sampleReviews;

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
        ></div>
        <div className={styles.info}>
          <h2>{product.model}</h2>
          <div className={styles.rating}>
            <div className={styles.starsWrapper}>{renderStars(product.star_review)}</div>
            <span className={styles.ratingText}>{product.star_review}/5</span>
          </div>
          <p className={styles.price}>₱{Number(product.price).toLocaleString()}</p>
          <p className={styles.descriptionText}>{product.description}</p>
          <div className={styles.sizeSelection}>
            <p className={styles.sizeTitle}>Choose Size</p>
            <div className={styles.sizeOptions}>
              {["40mm", "41mm", "42mm"].map((size) => (
                <button
                  key={size}
                  className={`${styles.sizeButton} ${
                    selectedSize === size ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.buttons}>
            <button className={styles.addToCart} onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className={styles.buyNowBtn} onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.reviewsContainer}>
          <div className={styles.reviewsTitleWrapper}>
            <h2 className={styles.reviewsTitle}>Rating & Reviews</h2>
          </div>
          
          <div className={styles.reviewsHeader}>
            <p className={styles.allReviewsText}>All Reviews ({sampleReviews.length})</p>
            {/* Button triggers login check via token prop */}
            <button className={styles.writeReviewBtn} onClick={handleWriteReviewClick}>
              Write a Review
            </button>
          </div>

          {/* STYLED REVIEW FORM */}
          {showReviewForm && (
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
                    placeholder="Tell us about your experience with this watch..."
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
            {reviewsToShow.map((review) => (
              <ReviewCard
                key={review.id}
                name={review.name}
                rating={review.rating}
                comment={review.comment}
                date={review.date}
              />
            ))}
          </div>
          {!isMobile && (
            <button className={styles.loadMoreBtn}>Load More Reviews</button>
          )}
        </div>

        <div className={styles.youMightAlsoLike}>
          <h2 className={styles.youMightAlsoLikeTitle}>You might also like</h2>
          <div className={styles.suggestionsGrid}>
            {suggestions.length > 0 ? suggestions.map((item) => (
              <div key={item.id} className={styles.suggestionCardWrapper}>
                <ProductCard
                  id={item.id}
                  model={item.model}
                  brand={item.brand}
                  star_review={item.star_review}
                  price={item.price}
                  image_link={item.image_link}
                />
              </div>
            )) : <p>No suggestions available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;