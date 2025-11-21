// Robredillo, Aljake Rey P.

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

// Styles
import style from "./styles/HomePage.module.css";

// Components
import ProductCard from "../components/ProductCard";
import ReviewCard from "../components/ReviewCard";

// JSON Data
import productsData from "../assets/products.json"; // fallback if not using API

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

// Sample reviews
const sampleReviews = [
  { id: 1, name: "Correllene I.", rating: 5, comment: "Absolutely in love with my new watch! The quality is outstanding and it looks even better in person. 10/10!", date: "October 1, 2025" },
  { id: 2, name: "Josua R.", rating: 4, comment: "Great customer service and fast shipping. The watch is beautiful, though a bit heavier than I expected. Still a fantastic piece.", date: "October 3, 2025" },
  { id: 3, name: "Ira S.", rating: 5, comment: "This was a gift for my husband and he was thrilled. The craftsmanship is impeccable. Will definitely be shopping here again.", date: "October 2, 2025" },
  { id: 4, name: "Aljake R.", rating: 5, comment: "From the unboxing experience to wearing it daily, everything about this watch is premium. Worth every penny.", date: "October 4, 2025" },
  { id: 5, name: "Benedic S.", rating: 5, comment: "I've been a watch collector for years, and this piece is a stunning addition. The detail on the dial is incredible.", date: "October 5, 2025" },
  { id: 6, name: "Gladwyn S.", rating: 4, comment: "A truly reliable and stylish timepiece. It's become my go-to for both formal events and casual outings.", date: "October 6, 2025" }
];

// API URL
const API = "http://localhost:8000/api";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const carouselRef = useRef(null);

  // Check localStorage for real token on load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setShowTopBanner(false); // hide banner if logged in
  }, []);

  // Fetch products from API or fallback to local JSON
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(`${API}/products`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
        setProducts(productsData); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Pre-filter all product sets
  const rolexProducts = products.filter(p => p.brand === "Rolex").slice(0, 4);
  const rmProducts = products.filter(p => p.brand === "Richard Mille").slice(0, 4);
  const casioProducts = products.filter(p => p.brand === "Casio").slice(0, 4);
  const seikoProducts = products.filter(p => p.brand === "Seiko").slice(0, 4);
  const omegaProducts = products.filter(p => p.brand === "Omega").slice(0, 4);

  // Carousel scroll function
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
      {/* 1. Hero Section */}
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

      {/* 2. Brand Banner */}
      <section className={style.brandBanner}>
        <img src={casioLogo} alt="Casio" className={style.bannerLogo} />
        <img src={rolexLogo} alt="Rolex" className={style.bannerLogo} />
        <img src={seikoLogo} alt="Seiko" className={style.bannerLogo} />
        <img src={omegaLogo} alt="Omega" className={style.bannerLogo} />
        <img src={richardLogo} alt="Richard Mille" className={style.bannerLogo} />
      </section>

      {/* 3-6. Product Sections */}
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
                {section.products.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))}
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

      {/* 7. Browse by Category */}
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

      {/* 8. Customer Reviews */}
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
            {sampleReviews.map(review => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
