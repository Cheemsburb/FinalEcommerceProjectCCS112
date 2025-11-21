import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./styles/ProductDetails.module.css";
import ReviewCard from "../components/ReviewCard";
import images from "../assets/imageLoader";

const sampleReviews = [
  { id: 1, name: "Correllene I.", rating: 5, comment: "Lorem ipsum dolor sit amet...", date: "October 1, 2025" },
  { id: 2, name: "Josua R.", rating: 4, comment: "Ut enim ad minim veniam...", date: "October 3, 2025" },
  { id: 3, name: "Ira S.", rating: 5, comment: "Duis aute irure dolor in reprehenderit...", date: "October 2, 2025" },
];

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  for (let i = 0; i < 5; i++) {
    stars.push(
      <span key={i} className={i < fullStars ? styles.starFilled : styles.starEmpty}>★</span>
    );
  }
  return stars;
};

function ProductDetails({ addToCart, token }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedSize, setSelectedSize] = React.useState("42mm");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
        if (data && data.case_size) setSelectedSize(data.case_size);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
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
    if (!product) return;
    const success = await addToCart(product, selectedSize);
    if (success) navigate("/cart");
  };

  if (isLoading) return <div className={styles.loading}>Loading...</div>;
  if (error || !product) return <div className={styles.loading}>Error: {error || "Product not found"}</div>;

  const imagePath = images[product.image_link] || images[product.image] || product.image_link || product.image || "";

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
          <p className={styles.descriptionText}>{product.description}</p>

          <div className={styles.sizeSelection}>
            <p className={styles.sizeTitle}>Choose Size</p>
            <div className={styles.sizeOptions}>
              {["40mm", "41mm", "42mm"].map((size) => (
                <button
                  key={size}
                  className={`${styles.sizeButton} ${selectedSize === size ? styles.selected : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.buttons}>
            <button className={styles.addToCart} onClick={handleAddToCart}>Add to Cart</button>
            <button className={styles.buyNowBtn} onClick={handleBuyNow}>Buy Now</button>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.reviewsContainer}>
          <h2 className={styles.reviewsTitle}>Rating & Reviews</h2>
          <div className={styles.reviewsGrid}>
            {sampleReviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
