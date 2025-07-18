import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const initialProduct = { name: '', category: '', price: '', stock: '', description: '', image: '' };

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(initialProduct);
  const [formMode, setFormMode] = useState('add');
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch user profile to check role
    fetch('http://localhost:5000/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.role || (data.role !== 'seller' && data.role !== 'admin')) {
          navigate('/');
        } else {
          setUser(data);
        }
      })
      .catch(() => navigate('/'));
  }, [navigate, token]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, orderRes] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      setProducts(prodData);
      setOrders(orderData);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
    // eslint-disable-next-line
  }, [user]);

  // Product form handlers
  const handleProductChange = e => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  // Image validation function
  const validateImageUrl = (url) => {
    if (!url) return { isValid: false, message: 'No URL provided' };
    
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      
      if (!validProtocols.includes(urlObj.protocol)) {
        return { isValid: false, message: 'Invalid protocol. Use HTTP or HTTPS.' };
      }
      
      const hasValidExtension = validExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );
      
      if (!hasValidExtension) {
        return { isValid: false, message: 'Invalid image format. Use JPG, PNG, WebP, or GIF.' };
      }
      
      return { isValid: true, message: 'Valid image URL' };
    } catch (error) {
      return { isValid: false, message: 'Invalid URL format' };
    }
  };

  const handleProductSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = formMode === 'add' ? 'POST' : 'PUT';
      const url = formMode === 'add'
        ? 'http://localhost:5000/api/products'
        : `http://localhost:5000/api/products/${editingProduct._id}`;
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      if (!res.ok) throw new Error('Failed to save product');
      setProductForm(initialProduct);
      setEditingProduct(null);
      setFormMode('add');
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = product => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      image: product.image || ''
    });
    setFormMode('edit');
  };

  const handleDeleteProduct = async id => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Order management
  const handleMarkDelivered = async id => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isDelivered: true })
      });
      if (!res.ok) throw new Error('Failed to update order');
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const pendingOrders = orders.filter(order => !order.isDelivered).length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(product => product.stock < 10).length;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header glass animate-fade-in">
        <div className="dashboard-header-content">
          <div className="dashboard-title">
            <i className="fas fa-chart-line"></i>
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-user">
            <i className="fas fa-user-circle"></i>
            <span>Welcome, {user?.name}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass animate-fade-in">
          <div className="stat-icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-content">
            <h3>{totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card glass animate-fade-in">
          <div className="stat-icon">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stat-content">
            <h3>₹{totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card glass animate-fade-in">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card glass animate-fade-in">
          <div className="stat-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-content">
            <h3>{lowStockProducts}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs glass animate-fade-in">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <i className="fas fa-box"></i>
          Product Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="fas fa-shopping-cart"></i>
          Order Management
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="tab-content animate-fade-in">
          {/* Add/Edit Product Form */}
          <div className="form-card glass">
            <div className="form-header">
              <h3 className="form-title">
                <i className={`fas ${formMode === 'add' ? 'fa-plus-circle' : 'fa-edit'}`}></i>
                {formMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h3>
              {formMode === 'edit' && (
                <div className="edit-indicator">
                  <i className="fas fa-pencil-alt"></i>
                  Editing: {editingProduct?.name}
                </div>
              )}
            </div>
            
            <form onSubmit={handleProductSubmit} className="product-form">
              {/* Basic Information */}
              <div className="form-section">
                <h4 className="section-subtitle">
                  <i className="fas fa-info-circle"></i>
                  Basic Information
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input 
                      name="name" 
                      placeholder="Enter product name" 
                      value={productForm.name} 
                      onChange={handleProductChange} 
                      required 
                      className="modern-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <input 
                      name="category" 
                      placeholder="e.g., Electronics, Groceries" 
                      value={productForm.category} 
                      onChange={handleProductChange} 
                      required 
                      className="modern-input"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="form-section">
                <h4 className="section-subtitle">
                  <i className="fas fa-tags"></i>
                  Pricing & Inventory
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <div className="input-with-icon">
                      <i className="fas fa-rupee-sign"></i>
                      <input 
                        name="price" 
                        type="number" 
                        step="0.01"
                        min="0"
                        placeholder="0.00" 
                        value={productForm.price} 
                        onChange={handleProductChange} 
                        required 
                        className="modern-input"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <div className="input-with-icon">
                      <i className="fas fa-boxes"></i>
                      <input 
                        name="stock" 
                        type="number" 
                        min="0"
                        placeholder="0" 
                        value={productForm.stock} 
                        onChange={handleProductChange} 
                        required 
                        className="modern-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="form-section">
                <h4 className="section-subtitle">
                  <i className="fas fa-align-left"></i>
                  Description
                </h4>
                <div className="form-group">
                  <label>Product Description</label>
                  <textarea 
                    name="description" 
                    placeholder="Enter detailed product description..." 
                    value={productForm.description} 
                    onChange={handleProductChange} 
                    className="modern-input"
                    rows="4"
                  />
                  <small className="form-help">Provide a detailed description to help customers understand your product better.</small>
                </div>
              </div>

              {/* Media */}
              <div className="form-section">
                <h4 className="section-subtitle">
                  <i className="fas fa-image"></i>
                  Product Images
                </h4>
                <div className="form-group">
                  <label>Image URL</label>
                  <div className="input-with-icon">
                    <i className="fas fa-link"></i>
                    <input 
                      name="image" 
                      type="url"
                      placeholder="https://example.com/image.jpg" 
                      value={productForm.image} 
                      onChange={handleProductChange} 
                      className="modern-input"
                    />
                  </div>
                  <small className="form-help">
                    Enter a valid image URL (JPG, PNG, WebP). Recommended size: 800x600px or larger.
                  </small>
                </div>
                
                {/* Enhanced Image Preview */}
                {productForm.image && (
                  <div className="image-preview">
                    <label>Image Preview:</label>
                    <div className="preview-container">
                      <img 
                        src={productForm.image} 
                        alt="Preview" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }} 
                      />
                      <div className="image-error" style={{ display: 'none' }}>
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>Invalid Image URL</span>
                      </div>
                    </div>
                    <div className="image-info">
                      {(() => {
                        const validation = validateImageUrl(productForm.image);
                        return (
                          <span className={`image-status ${validation.isValid ? 'valid' : 'invalid'}`}>
                            <i className={`fas ${validation.isValid ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                            {validation.message}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Image Format Guidelines */}
                <div className="image-guidelines">
                  <h5 className="guidelines-title">
                    <i className="fas fa-info-circle"></i>
                    Image Guidelines
                  </h5>
                  <div className="guidelines-list">
                    <div className="guideline-item">
                      <i className="fas fa-check"></i>
                      <span>Supported formats: JPG, PNG, WebP, GIF</span>
                    </div>
                    <div className="guideline-item">
                      <i className="fas fa-check"></i>
                      <span>Recommended size: 800x600px or larger</span>
                    </div>
                    <div className="guideline-item">
                      <i className="fas fa-check"></i>
                      <span>Maximum file size: 5MB</span>
                    </div>
                    <div className="guideline-item">
                      <i className="fas fa-check"></i>
                      <span>Use high-quality, clear images</span>
                    </div>
                  </div>
                  
                  {/* Sample Images */}
                  <div className="sample-images">
                    <h6 className="sample-title">
                      <i className="fas fa-lightbulb"></i>
                      Sample Images for Testing
                    </h6>
                    <div className="sample-buttons">
                      <button 
                        type="button"
                        onClick={() => setProductForm({...productForm, image: 'https://picsum.photos/800/600?random=1'})}
                        className="sample-btn"
                      >
                        <i className="fas fa-image"></i>
                        Sample 1
                      </button>
                      <button 
                        type="button"
                        onClick={() => setProductForm({...productForm, image: 'https://picsum.photos/800/600?random=2'})}
                        className="sample-btn"
                      >
                        <i className="fas fa-image"></i>
                        Sample 2
                      </button>
                      <button 
                        type="button"
                        onClick={() => setProductForm({...productForm, image: 'https://picsum.photos/800/600?random=3'})}
                        className="sample-btn"
                      >
                        <i className="fas fa-image"></i>
                        Sample 3
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i>
                  {formMode === 'add' ? 'Add Product' : 'Update Product'}
                </button>
                {formMode === 'edit' && (
                  <button 
                    type="button" 
                    onClick={() => { 
                      setFormMode('add'); 
                      setProductForm(initialProduct); 
                      setEditingProduct(null); 
                    }}
                    className="btn-secondary"
                  >
                    <i className="fas fa-times"></i>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            <h3 className="section-title">
              <i className="fas fa-boxes"></i>
              All Products ({products.length})
            </h3>
            
            <div className="products-cards">
              {products.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-box-open"></i>
                  <h3>No Products Found</h3>
                  <p>Start by adding your first product using the form above.</p>
                </div>
              ) : (
                products.map(product => (
                  <div key={product._id} className="product-card glass">
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                      <div className="product-badge">
                        {product.stock < 10 && <span className="badge low-stock">Low Stock</span>}
                        {product.stock === 0 && <span className="badge out-of-stock">Out of Stock</span>}
                      </div>
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-category">
                        <i className="fas fa-tag"></i>
                        {product.category}
                      </p>
                      <div className="product-details">
                        <span className="product-price">₹{product.price}</span>
                        <span className={`product-stock ${product.stock < 10 ? 'low-stock' : ''}`}>
                          <i className="fas fa-boxes"></i>
                          Stock: {product.stock}
                        </span>
                      </div>
                      {product.description && (
                        <p className="product-description">{product.description}</p>
                      )}
                    </div>
                    <div className="product-actions">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="btn-edit"
                        title="Edit Product"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="btn-delete"
                        title="Delete Product"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="tab-content animate-fade-in">
          <div className="orders-section">
            <h3 className="section-title">
              <i className="fas fa-shopping-cart"></i>
              Order Management ({orders.length})
            </h3>
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order._id} className="order-card glass">
                  <div className="order-header">
                    <div className="order-id">
                      <i className="fas fa-hashtag"></i>
                      {order._id.slice(-8)}
                    </div>
                    <div className={`order-status ${order.isDelivered ? 'delivered' : 'pending'}`}>
                      <i className={`fas ${order.isDelivered ? 'fa-check-circle' : 'fa-clock'}`}></i>
                      {order.isDelivered ? 'Delivered' : 'Processing'}
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-info">
                      <p><i className="fas fa-user"></i> {order.user?.name || 'N/A'}</p>
                      <p><i className="fas fa-calendar"></i> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p><i className="fas fa-rupee-sign"></i> ₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                    
                    <div className="order-items">
                      <h4>Order Items:</h4>
                      {order.items?.map((item, index) => (
                        <div key={index} className="order-item">
                          <span>{item.name}</span>
                          <span>Qty: {item.qty}</span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="order-actions">
                    {!order.isDelivered && (
                      <button 
                        onClick={() => handleMarkDelivered(order._id)}
                        className="btn-primary"
                      >
                        <i className="fas fa-check"></i>
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 