import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./styles/ProductListing.module.css";
import ProductCard from "../components/ProductCard";
import productsData from "../assets/products.json";
import PriceRangeSlider from "../components/PriceRangeSlider";

// Member 3 : Rigodon, Josua
function ProductListing() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([500, 400000]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // 1. Add state for the filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const brandParams = searchParams.getAll('brand');
    const categoryParams = searchParams.getAll('category');

    if (brandParams.length > 0) {
        setSelectedBrands(brandParams);
    }
    if (categoryParams.length > 0) {
        setSelectedCategories(categoryParams);
    }
  }, [searchParams]);

  useEffect(() => {
    // Prevent scrolling when filter is open
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isFilterOpen]);


  useEffect(() => {
    let filtered = [...productsData];
    // ... (filtering logic remains the same) ...
    if (selectedBrands.length > 0) {
      const lowerSelectedBrands = selectedBrands.map(b => b.toLowerCase());
      filtered = filtered.filter(item =>
        item.brand && lowerSelectedBrands.includes(item.brand.toLowerCase())
      );
    }
    filtered = filtered.filter(item => item.price >= priceRange[0] && item.price <= priceRange[1]);
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(item => item.case_size && selectedSizes.includes(item.case_size));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(item =>
        item.category && Array.isArray(item.category) && item.category.some(cat => selectedCategories.includes(cat))
      );
    }
    
    setProducts(filtered);
    setCurrentPage(1);
  }, [selectedBrands, priceRange, selectedSizes, selectedCategories]);

  // 2. Add a function to toggle the filter
  const toggleFilter = () => {
    setIsFilterOpen(prev => !prev);
  };

  // --- Handlers remain the same ---
  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };
  const handleSizeChange = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };
  const handlePriceChange = useCallback(([min, max]) => {
    setPriceRange([min, max]);
  }, []);

  // ... (pagination logic remains the same) ...
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginate = (pageNumber) => {
     if (pageNumber >= 1 && pageNumber <= totalPages) {
       setCurrentPage(pageNumber);
     }
  };


  const getHeaderTitle = () => {
    // ... (getHeaderTitle logic remains the same) ...
    const hasBrands = selectedBrands.length > 0;
    const hasCategories = selectedCategories.length > 0;
    const brandString = selectedBrands.join(' & ');
    const categoryString = selectedCategories.join(' & ');
    if (hasBrands && hasCategories) { return `${brandString} ${categoryString}`; }
    else if (hasBrands) { return brandString; }
    else if (hasCategories) { return categoryString; }
    else { return "All Watches"; }
  };

  return (
    <div className={styles.wrapper}>
      {/* 3. Add conditional class to sidebar. Add overlay for closing. */}
      {isFilterOpen && <div className={styles.overlay} onClick={toggleFilter}></div>}
      <aside className={`${styles.sidebar} ${isFilterOpen ? styles.sidebarOpen : ''}`}>
         <div className={styles.filterHeader}>
          <h3>Filters</h3>
          {/* 4. Make the original icon a "close" button on mobile */}
          <span className={styles.filterIcon} onClick={toggleFilter}>
            <span className={styles.desktopIcon}>☰</span>
            <span className={styles.mobileCloseIcon}>&times;</span>
          </span>
        </div>
        <div className={styles.filterContent}> {/* Added wrapper for scrolling */}
          <div className={styles.filterSection}>
            <h4>Brand</h4>
            {["Rolex", "Omega", "Seiko", "Richard Mille", "Casio"].map(brand => (
              <div key={brand} className={styles.checkboxItem}>
                <input type="checkbox" id={`brand-${brand}`} name="brand" value={brand} onChange={() => handleBrandChange(brand)} checked={selectedBrands.includes(brand)} />
                <label htmlFor={`brand-${brand}`}>{brand}</label>
              </div>
            ))}
          </div>
          <div className={styles.filterSection}>
              <h4>Price</h4>
              <div className={styles.priceSlidersContainer}>
                <PriceRangeSlider
                  min={500}
                  max={400000}
                  onChange={handlePriceChange}
                />
              </div>
              <div className={styles.priceLabelsContainer}>
                <div className={styles.priceLabel}> <label>Min</label> <span>₱{priceRange[0].toLocaleString()}</span> </div>
                <div className={styles.priceLabel}> <label>Max</label> <span>₱{priceRange[1].toLocaleString()}</span> </div>
              </div>
          </div>
          <div className={styles.filterSection}>
              <h4>Size</h4>
              <div className={styles.sizeOptions}>
                  {["40mm", "41mm", "42mm"].map(size => (
                      <button key={size} onClick={() => handleSizeChange(size)} className={`${styles.sizeButton} ${selectedSizes.includes(size) ? styles.activeButton : ''}`}> {size} </button>
                  ))}
              </div>
          </div>
          <div className={styles.filterSection}>
              <h4>Categories</h4>
              {["Men's", "Women's", "Formal", "Sportswear"].map(cat => (
                  <div key={cat} className={styles.checkboxItem}>
                      <input type="checkbox" id={`cat-${cat}`} name="category" value={cat} onChange={() => handleCategoryChange(cat)} checked={selectedCategories.includes(cat)}/>
                      <label htmlFor={`cat-${cat}`}>{cat}</label>
                  </div>
              ))}
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        {/* 5. Add the mobile-only filter trigger */}
        <div className={styles.mobileFilterTrigger} onClick={toggleFilter}>
            <span>Filters</span>
            <span className={styles.filterIcon}>☰</span>
        </div>

        <div className={styles.header}>
          <h2>{getHeaderTitle()}</h2>
          <p>Showing {products.length > 0 ? indexOfFirstProduct + 1 : 0}–{Math.min(indexOfLastProduct, products.length)} of {products.length} Products</p>
        </div>
        
        {/* ... (rest of the main content remains the same) ... */}
        {currentProducts.length > 0 ? (
          <div className={styles.grid}>
            {currentProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <p className={styles.noProducts}>No products match the selected filters.</p>
        )}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}> &larr; Previous </button>
            {[...Array(totalPages).keys()].map(number => {
              const pageNumber = number + 1;
              if (pageNumber === 1 || pageNumber === totalPages || Math.abs(currentPage - pageNumber) <= 1) {
                return ( <button key={pageNumber} onClick={() => paginate(pageNumber)} className={currentPage === pageNumber ? styles.activePage : ''}> {pageNumber} </button> );
              } else if (Math.abs(currentPage - pageNumber) === 2) {
                 return <span key={`ellipsis-${pageNumber}`} className={styles.ellipsis}>...</span>;
              }
              return null;
            })}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}> Next &rarr; </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductListing;