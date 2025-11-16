import React from "react"; // 1. Import useState and useEffect from React
import { useParams, useNavigate } from "react-router-dom";
import styles from "./styles/ProductDetails.module.css";
import ProductCard from "../components/ProductCard";
import ReviewCard from "../components/ReviewCard";
import products from "../assets/products.json";
import images from "../assets/imageLoader";


// Sample review data updated to 6 reviews
const sampleReviews = [
  { id: 1, name: "Correllene I.", rating: 5, comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", date: "October 1, 2025" },
  { id: 2, name: "Josua R.", rating: 4, comment: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", date: "October 3, 2025" },
  { id: 3, name: "Ira S.", rating: 5, comment: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.", date: "October 2, 2025" },
  { id: 4, name: "Aljake R.", rating: 4, comment: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", date: "October 4, 2025" },
  { id: 5, name: "Benedic S.", rating: 5, comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", date: "October 5, 2025" },
  { id: 6, name: "Gladwyn S.", rating: 4, comment: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.", date: "October 6, 2025" }
];

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

function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = React.useState("");
  const [selectedSize, setSelectedSize] = React.useState("42mm");

  // 2. Add state to track mobile view
  const [isMobile, setIsMobile] = React.useState(false);

  // 3. Add useEffect to check window size
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    
    handleResize(); // Call on initial mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures this runs only on mount and unmount


  const product = products.find((p) => p.id === parseInt(id));

  if (!product) {
    return <div className={styles.loading}>Product not found...</div>;
  }

  const imagePath = images[product.image_link];

  const suggestions = products.filter(
    (p) => p.brand === product.brand && p.model !== product.model
  ).slice(0, 4);

  const handleAddToCart = () => {
    // ... (logic unchanged)
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
    // ... (logic unchanged)
    addToCart({
      id: product.id,
      model: product.model,
      brand: product.brand,
      price: product.price,
      star_review: product.star_review,
      image: product.image_link,
      size: selectedSize,
    });
    navigate("/cart");
  };

  // 4. Create a new variable for reviews based on isMobile state
  const reviewsToShow = isMobile ? sampleReviews.slice(0, 3) : sampleReviews;

  return (
    <div className={styles.detailsPage}>
      {message && <div className={styles.toast}>{message}</div>}

      <div className={styles.topSection}>
        {/* ... (top section unchanged) ... */}
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
          <p className={styles.price}>₱{product.price.toLocaleString()}</p>
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
            <p className={styles.allReviewsText}>All Reviews (32)</p>
            <button className={styles.writeReviewBtn}>Write a Review</button>
          </div>
          <div className={styles.reviewsGrid}>
            {/* 5. Map over reviewsToShow instead of sampleReviews */}
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
          {/* 6. Conditionally hide the "Load More" button on mobile */}
          {!isMobile && (
            <button className={styles.loadMoreBtn}>Load More Reviews</button>
          )}
        </div>

        <div className={styles.youMightAlsoLike}>
          {/* ... (you might like section unchanged) ... */}
          <h2 className={styles.youMightAlsoLikeTitle}>You might also like</h2>
          <div className={styles.suggestionsGrid}>
            {suggestions.map((item) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;