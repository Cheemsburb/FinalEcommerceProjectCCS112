import React, { useState, useEffect, useRef } from "react";
import style from "./styles/Navbar.module.css";
import cartIcon from "../assets/designs/icons/cart.png";
import profileIcon from "../assets/designs/icons/profile.png";
import searchIcon from "../assets/designs/icons/search.png";
import searchMobile from "../assets/designs/icons/search-mobile.png";
import dropdownIcon from "../assets/designs/icons/dropdown.png";
import imageLoader from "../assets/imageLoader";
import products from "../assets/products.json";
import { Link } from "react-router-dom";

const CATEGORIES = ["Men's", "Women's", "Formal", "Sportswear"];
const BRANDS = ["Rolex", "Omega", "Seiko", "Richard Mille", "Casio"];

function Navbar({ onSearchChange }) {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [showTopBanner, setShowTopBanner] = useState(!token);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Update banner visibility if token changes
  useEffect(() => {
    setShowTopBanner(!token);
  }, [token]);

  const closeTopBanner = () => setShowTopBanner(false);

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.model.toLowerCase().includes(lowerCaseQuery) ||
        product.brand.toLowerCase().includes(lowerCaseQuery)
    );
    setSearchResults(filtered.slice(0, 5));
    if (onSearchChange) onSearchChange(searchQuery);
  }, [searchQuery, onSearchChange]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (event) => setSearchQuery(event.target.value);
  const toggleDropdown = (name) => setOpenDropdown(openDropdown === name ? null : name);
  const toggleMobileMenu = () => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsMobileSearchOpen(false); setSearchResults([]); };
  const toggleMobileSearch = () => { setIsMobileSearchOpen(!isMobileSearchOpen); setIsMobileMenuOpen(false); if (!isMobileSearchOpen) { setSearchQuery(""); setSearchResults([]); } };
  const closeAllMenus = () => { setOpenDropdown(null); setIsMobileMenuOpen(false); };
  const handleResultClick = () => { setSearchQuery(""); setSearchResults([]); setIsMobileSearchOpen(false); };
  const handleDropdownItemClick = () => { setOpenDropdown(null); setIsMobileMenuOpen(false); };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className={style.navbar} tabIndex="-1">
      {/* Top Banner */}
      {showTopBanner && (
        <div className={style.topBanner}>
          <p>Sign up and get 20% off to your first order. <Link to="/register">Sign Up Now</Link></p>
          <button className={style.closeButton} onClick={closeTopBanner}>&times;</button>
        </div>
      )}

      {/* Main Navigation Bar */}
      {!isMobileSearchOpen ? (
        <div className={style.mainNav}>
          {/* Hamburger Button */}
          <button className={style.hamburgerButton} onClick={toggleMobileMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
            <svg viewBox="0 0 100 80" width="25" height="25" fill="#000">
              <rect width="100" height="15" rx="8"></rect>
              <rect y="30" width="100" height="15" rx="8"></rect>
              <rect y="60" width="100" height="15" rx="8"></rect>
            </svg>
          </button>

          {/* Logo */}
          <div className={style.logo}>
            <Link to="/" className={style.logoLink}>
              <span className={style.logoText}>WTCH</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className={style.navLinks}>
            <div className={style.dropdown} onClick={() => toggleDropdown('categories')} role="button" aria-expanded={openDropdown === 'categories'}>
              Categories <img src={dropdownIcon} alt="" className={style.arrowIcon} />
              {openDropdown === 'categories' && (
                <div className={style.dropdownMenu}>
                  {CATEGORIES.map(cat => (
                    <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className={style.dropdownItem} onClick={handleDropdownItemClick}>
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className={style.dropdown} onClick={() => toggleDropdown('brands')} role="button" aria-expanded={openDropdown === 'brands'}>
              Brands <img src={dropdownIcon} alt="" className={style.arrowIcon} />
              {openDropdown === 'brands' && (
                <div className={style.dropdownMenu}>
                  {BRANDS.map(brand => (
                    <Link key={brand} to={`/products?brand=${encodeURIComponent(brand)}`} className={style.dropdownItem} onClick={handleDropdownItemClick}>
                      {brand}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Search */}
          <div className={`${style.searchContainer} ${style.searchContainerDesktop}`} ref={searchContainerRef}>
            <div className={style.searchInputWrapper}>
              <img src={searchIcon} alt="Search" className={style.searchIcon} />
              <input type="text" placeholder="Search for products..." value={searchQuery} onChange={handleSearchChange} className={style.searchInput} />
            </div>
            {searchResults.length > 0 && (
              <div className={style.searchResults}>
                {searchResults.map(item => {
                  const imageSrc = imageLoader[item.image_link];
                  return (
                    <Link key={item.id} to={`/products/${item.id}`} className={style.searchResultItem} onClick={handleResultClick}>
                      <img src={imageSrc || 'https://placehold.co/40x40/eee/ccc?text=?'} alt={item.model} className={style.searchResultImage} onError={(e) => { e.target.src = 'https://placehold.co/40x40/eee/ccc?text=?'; }} />
                      <div className={style.searchResultInfo}>
                        <span className={style.searchResultModel}>{item.model}</span>
                        <span className={style.searchResultBrand}>{item.brand}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className={style.userActions}>
            <button className={`${style.iconButton} ${style.searchIconButtonMobile}`} onClick={toggleMobileSearch} aria-label="Open search">
              <img src={searchMobile} alt="Search" className={style.actionIcon} />
            </button>
            <Link to="/cart" className={style.iconButton} aria-label="Shopping Cart">
              <img src={cartIcon} alt="" className={style.actionIcon} />
            </Link>
            <Link to="/profile" className={style.iconButton} aria-label="User Profile">
              <img src={profileIcon} alt="" className={style.actionIcon} />
            </Link>
          </div>
        </div>
      ) : (
        /* Mobile Search Overlay */
        <div className={style.mobileSearchOverlay}>
          <button className={style.mobileSearchClose} onClick={toggleMobileSearch} aria-label="Close search">&times;</button>
          <div className={`${style.mobileSearchInputWrapper} ${style.searchContainerMobile}`} ref={searchContainerRef}>
            <img src={searchIcon} alt="Search" className={style.searchIcon} />
            <input type="text" placeholder="Search for products..." value={searchQuery} onChange={handleSearchChange} className={style.mobileSearchInput} autoFocus />
            {searchResults.length > 0 && (
              <div className={`${style.searchResults} ${style.searchResultsMobile}`}>
                {searchResults.map(item => {
                  const imageSrc = imageLoader[item.image_link];
                  return (
                    <Link key={item.id} to={`/products/${item.id}`} className={style.searchResultItem} onClick={handleResultClick}>
                      <img src={imageSrc || 'https://placehold.co/40x40/eee/ccc?text=?'} alt={item.model} className={style.searchResultImage} onError={(e) => { e.target.src = 'https://placehold.co/40x40/eee/ccc?text=?'; }} />
                      <div className={style.searchResultInfo}>
                        <span className={style.searchResultModel}>{item.model}</span>
                        <span className={style.searchResultBrand}>{item.brand}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`${style.mobileMenu} ${isMobileMenuOpen ? style.open : ''}`}>
        <button className={style.mobileMenuClose} onClick={toggleMobileMenu} aria-label="Close menu">&times;</button>
        <h3>Categories</h3>
        {CATEGORIES.map(cat => (
          <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className={style.mobileMenuItem} onClick={handleDropdownItemClick}>
            {cat}
          </Link>
        ))}
        <hr className={style.mobileMenuDivider}/>
        <h3>Brands</h3>
        {BRANDS.map(brand => (
          <Link key={brand} to={`/products?brand=${encodeURIComponent(brand)}`} className={style.mobileMenuItem} onClick={handleDropdownItemClick}>
            {brand}
          </Link>
        ))}
      </div>
    </header>
  );
}

export default Navbar;
