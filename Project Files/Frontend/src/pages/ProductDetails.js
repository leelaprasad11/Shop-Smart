import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
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
      existing.qty += qty;
    } else {
      cart.push({ 
        productId: product._id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        qty 
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleQuantityChange = (newQty) => {
    const validQty = Math.max(1, Math.min(product.stock, newQty));
    setQty(validQty);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <Link to="/" className="btn-primary">
          <i className="fas fa-home"></i>
          Back to Home
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="product-details-container">
      <div className="product-details-content glass animate-fade-in">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">
            <i className="fas fa-home"></i>
            Home
          </Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/" className="breadcrumb-link">
            Products
          </Link>
          <i className="fas fa-chevron-right"></i>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message animate-fade-in">
            <i className="fas fa-check-circle"></i>
            <span>{product.name} added to cart successfully!</span>
          </div>
        )}

        <div className="product-details-grid">
          {/* Product Images */}
          <div className="product-images-section">
            <div className="main-image-container">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="main-product-image"
                />
              ) : (
                <div className="image-placeholder">
                  <i className="fas fa-image"></i>
                  <span>No Image Available</span>
                </div>
              )}
              <div className="image-overlay">
                <i className="fas fa-search-plus"></i>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-category">
                <i className="fas fa-tag"></i>
                <span>{product.category}</span>
              </div>
            </div>

            <div className="product-price-section">
              <div className="price-display">
                <span className="price-amount">₹{product.price}</span>
                <span className="price-label">INR</span>
              </div>
              <div className="stock-status">
                <i className={`fas ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                  {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <div className="product-description">
              <h3 className="description-title">
                <i className="fas fa-info-circle"></i>
                Description
              </h3>
              <p className="description-text">{product.description}</p>
            </div>

            {product.stock > 0 && (
              <div className="quantity-section">
                <label className="quantity-label">
                  <i className="fas fa-sort-numeric-up"></i>
                  Quantity
                </label>
                <div className="quantity-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(qty - 1)}
                    disabled={qty <= 1}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={qty}
                    onChange={e => handleQuantityChange(Number(e.target.value))}
                    className="quantity-input"
                  />
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(qty + 1)}
                    disabled={qty >= product.stock}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <span className="stock-info">Available: {product.stock} units</span>
              </div>
            )}

            <div className="product-actions">
              <button 
                onClick={handleAddToCart} 
                disabled={product.stock === 0}
                className="add-to-cart-btn btn-primary"
              >
                <i className="fas fa-cart-plus"></i>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <Link to="/cart" className="view-cart-btn btn-secondary">
                <i className="fas fa-shopping-cart"></i>
                View Cart
              </Link>
            </div>

            <div className="product-features">
              <div className="feature-item">
                <i className="fas fa-shipping-fast"></i>
                <span>Free Shipping</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-shield-alt"></i>
                <span>Secure Payment</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-undo"></i>
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 