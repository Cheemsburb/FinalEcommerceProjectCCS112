// Robredillo, Aljake Rey P.

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

// Styles
import style from "./styles/HomePage.module.css";

// Components
import ProductCard from "../components/ProductCard";
import ReviewCard from "../components/ReviewCard";

// Images
import heroNew from "../assets/designs/hero-page-bg-removebg-preview.png";
import mens from "../assets/designs/person-01.jpg";
import womens from "../assets/designs/person-02.jpg";
import formal from "../assets/designs/person-04.png";
import sportwear from "../assets/designs/person-03.png";

// Brand logos
import rolexLogo from "../assets/designs/logos/rolex-logo.png";
import omegaLogo from "../assets/designs/logos/omega-logo.png";
import seikoLogo from "../assets/designs/logos/seiko-logo.png";
import richardLogo from "../assets/designs/logos/richard-mille-logo.png";
import casioLogo from "../assets/designs/logos/casio-logo.png";

// Brand labels
import casioLabel from "../assets/designs/label/casio-label.png";
import omegaLabel from "../assets/designs/label/omega-label.png";
import richardLabel from "../assets/designs/label/richard-mille-label.png";
import rolexLabel from "../assets/designs/label/rolex-label.png";
import seikoLabel from "../assets/designs/label/seiko-label.png";

// API URL
const API = "http://localhost:8000/api";

function HomePage({ addToCart, token }) {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]); // State for reviews
  const [loading, setLoading] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const carouselRef = useRef(null);

  // Fetch products (and reviews) from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/products`, { headers });
        
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProducts(data);

        // --- EXTRACT RANDOM REVIEWS FROM PRODUCTS ---
        const allReviews = [];
        if (data && Array.isArray(data)) {
          data.forEach(product => {
            if (product.reviews && Array.isArray(product.reviews)) {
              product.reviews.forEach(review => {
                // Ensure the review has a user attached before adding
                if (review.user) {
                  allReviews.push({
                    id: review.id,
                    name: `${review.user.first_name} ${review.user.last_name}`,
                    rating: review.rating,
                    comment: review.description, // Map 'description' to 'comment' for ReviewCard
                    date: new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  });
                }
              });
            }
          });
        }

        // Shuffle and pick up to 6 random reviews
        const shuffledReviews = allReviews.sort(() => 0.5 - Math.random());
        setReviews(shuffledReviews.slice(0, 6));
        // --------------------------------------------

      } catch (err) {
        console.error("Error loading products/reviews from API:", err);
        setProducts([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  // Pre-filter product sets
  const rolexProducts = products.filter(p => p.brand === "Rolex").slice(0, 4);
  const rmProducts = products.filter(p => p.brand === "Richard Mille").slice(0, 4);
  const casioProducts = products.filter(p => p.brand === "Casio").slice(0, 4);
  const seikoProducts = products.filter(p => p.brand === "Seiko").slice(0, 4);
  const omegaProducts = products.filter(p => p.brand === "Omega").slice(0, 4);

  // Carousel scroll
  const scroll = (direction) => {
    if (carouselRef.current && carouselRef.current.children.length > 0) {
      const card = carouselRef.current.children[0];
      const cardWidth = card.offsetWidth;
      const gapValue = parseFloat(window.getComputedStyle(carouselRef.current).gap) || (1.5 * 16);
      const scrollAmount = (cardWidth + gapValue) * (direction === 'left' ? -1 : 1);
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <main>

      {/* Hero Section */}
      <section className={style.heroSection}>
        <div className={style.heroContent}>
          <h1>MATCH YOUR STYLE WITH THE RIGHT WATCH</h1>
          <p>Shop from our latest collection of premium watches from top brands around the world.</p>
          <Link to="/products">
            <button className={style.heroButton}>Go Shopping</button>
          </Link>
        </div>
        <div className={style.heroImageContainer}>
          <img src={heroNew} alt="Models wearing watches" className={style.heroImage} />
        </div>
      </section>

      {/* Brand Banner */}
      <section className={style.brandBanner}>
        <img src={casioLogo} alt="Casio" className={style.bannerLogo} />
        <img src={rolexLogo} alt="Rolex" className={style.bannerLogo} />
        <img src={seikoLogo} alt="Seiko" className={style.bannerLogo} />
        <img src={omegaLogo} alt="Omega" className={style.bannerLogo} />
        <img src={richardLogo} alt="Richard Mille" className={style.bannerLogo} />
      </section>

      {/* Product Sections */}
      {[ 
        {label: rolexLabel, products: rolexProducts, brand: "Rolex"}, 
        {label: richardLabel, products: rmProducts, brand: "Richard Mille"}, 
        {label: casioLabel, products: casioProducts, brand: "Casio"}, 
        {label: seikoLabel, products: seikoProducts, brand: "Seiko"}, 
        {label: omegaLabel, products: omegaProducts, brand: "Omega"} 
      ].map((section, index) => (
        (index < 2 || showAllBrands) && (
          <section key={section.brand} className={style.productHighlight}>
            <div className={style.container}>
              <img src={section.label} alt={section.brand} className={style.sectionLabel} />
              <hr className={style.divider} />
              <div className={style.productGrid}>
                {section.products.length > 0 ? (
                  section.products.map(product => (
                    <ProductCard key={product.id} {...product} addToCart={addToCart} token={token} />
                  ))
                ) : (
                  <p className={style.noProducts}>No products found for {section.brand}.</p>
                )}
              </div>
              <Link to={`/products?brand=${encodeURIComponent(section.brand)}`} className={style.viewAllButton}>
                View All
              </Link>
            </div>
          </section>
        )
      ))}

      {!showAllBrands && (
        <div className={style.showMoreContainer}>
          <button onClick={() => setShowAllBrands(true)} className={style.showMoreButton}>Show More Brands</button>
        </div>
      )}

      {/* Browse by Category */}
      <section className={style.categorySection}>
        <div className={style.container}>
          <div className={style.categoryWrapper}>
            <h2 className={style.sectionTitle}>BROWSE BY CATEGORY</h2>
            <div className={style.categoryGrid}>
              <div className={style.categoryCard}>
                <div className={style.categoryOverlay}><h3>Men's</h3></div>
                <Link to="/products?category=Men%27s"><img src={mens} alt="Men's Watches"/> </Link>
              </div>
              <div className={style.categoryCard}>
                <div className={style.categoryOverlay}><h3>Women's</h3></div>
                <Link to="/products?category=Women%27s"><img src={womens} alt="Women's Watches"/> </Link>
              </div>
              <div className={style.categoryCard}>
                <div className={style.categoryOverlay}><h3>Formal</h3></div>
                <Link to="/products?category=Formal"><img src={formal} alt="Formal Watches"/></Link>
              </div>
              <div className={style.categoryCard}>
                <div className={style.categoryOverlay}><h3>Sportswear</h3></div>
                <Link to="/products?category=Sportswear"><img src={sportwear} alt="Sportswear Watches"/> </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews (Dynamic) */}
      <section className={style.reviewSection}>
        <div className={style.container}>
          <div className={style.reviewHeader}>
            <h2 className={style.sectionTitle}>OUR HAPPY CUSTOMERS</h2>
            <div className={style.reviewNav}>
              <button onClick={() => scroll('left')} title="Scroll left">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button onClick={() => scroll('right')} title="Scroll right">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
          
          <div className={style.reviewCarousel} ref={carouselRef}>
            {reviews.length > 0 ? (
              reviews.map(review => (
                <ReviewCard key={review.id} {...review} />
              ))
            ) : (
              <p style={{ textAlign: 'center', width: '100%', color: '#666' }}>No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;