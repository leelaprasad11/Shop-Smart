import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(null);
  const [cartMessage, setCartMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        /* ignore product error */
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        /* ignore category error */
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUserName(data.name))
        .catch(() => setUserName(null));
    } else {
      setUserName(null);
    }
  }, []);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    
    // Check if user is logged in
    if (!token) {
      // Redirect to login page if not logged in
      navigate('/login');
      return;
    }
    
    // If logged in, proceed with adding to cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ 
        productId: product._id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        qty: 1 
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartMessage(`${product.name} added to cart!`);
    setTimeout(() => setCartMessage(''), 1500);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing products...</p>
      </div>
    );
  }

  // Remove error display to prevent red color showing above cart
  // if (error) {
  //   return (
  //     <div className="error-container">
  //       <i className="fas fa-exclamation-triangle"></i>
  //       <h3>Oops! Something went wrong</h3>
  //       <p>{error}</p>
  //     </div>
  //   );
  // }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section glass animate-fade-in">
        <div className="hero-content">
          <h1 className="hero-title">
            {userName ? (
              <>
                Welcome back, <span className="highlight">{userName}</span>! 
                <i className="fas fa-sparkles"></i>
              </>
            ) : (
              <>
                Welcome to <span className="highlight">Shop Smart</span>
                <i className="fas fa-star"></i>
              </>
            )}
          </h1>
          <p className="hero-subtitle">
            Discover amazing products with unbeatable quality and prices
          </p>
        </div>
      </div>

      {/* Success Message */}
      {cartMessage && (
        <div className="message success animate-fade-in">
          <i className="fas fa-check-circle"></i>
          {cartMessage}
        </div>
      )}

      {/* Category Filter */}
      <div className="category-section glass animate-slide-in">
        <h3 className="section-title">
          <i className="fas fa-filter"></i>
          Browse Categories
        </h3>
        <div className="category-buttons">
          <button
            className={`category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            <i className="fas fa-th-large"></i>
            All Products
          </button>
          {categories.map((cat, index) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <i className="fas fa-tag"></i>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-section">
        <h3 className="section-title">
          <i className="fas fa-shopping-bag"></i>
          {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Products`}
          <span className="product-count">({filteredProducts.length})</span>
        </h3>
        
        {filteredProducts.length === 0 ? (
          <div className="no-products glass">
            <i className="fas fa-search"></i>
            <h3>No products found</h3>
            <p>Try selecting a different category or check back later!</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="product-card modern-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link
                  to={`/product/${product._id}`}
                  className="product-link"
                >
                  <div className="product-image-container">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <i className="fas fa-image"></i>
                      </div>
                    )}
                    <div className="product-overlay">
                      <i className="fas fa-eye"></i>
                    </div>
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <span className="product-category">
                      <i className="fas fa-tag"></i>
                      {product.category}
                    </span>
                    <div className="product-price">
                      <span className="price-amount">₹{product.price}</span>
                      <span className="price-label">INR</span>
                    </div>
                  </div>
                </Link>
                
                <button
                  className="add-to-cart-btn btn-primary"
                  onClick={() => handleAddToCart(product)}
                >
                  <i className="fas fa-cart-plus"></i>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 