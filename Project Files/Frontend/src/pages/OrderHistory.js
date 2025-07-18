import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/orders/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
      </div>
    );
  }

  const getStatusIcon = (isDelivered) => {
    return isDelivered ? 'fas fa-check-circle' : 'fas fa-clock';
  };

  const getStatusColor = (isDelivered) => {
    return isDelivered ? '#28a745' : '#ffc107';
  };

  const getStatusText = (isDelivered) => {
    return isDelivered ? 'Delivered' : 'Processing';
  };

  return (
    <div className="orders-container">
      <div className="orders-content glass animate-fade-in">
        <div className="orders-header">
          <h2 className="orders-title">
            <i className="fas fa-history"></i>
            Order History
          </h2>
          <p className="orders-subtitle">
            {orders.length === 0 
              ? 'You haven\'t placed any orders yet' 
              : `You have ${orders.length} order${orders.length !== 1 ? 's' : ''} in your history`
            }
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="empty-orders modern-card">
            <i className="fas fa-shopping-bag"></i>
            <h3>No Orders Yet</h3>
            <p>Start shopping to see your order history here!</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-shopping-cart"></i>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => (
              <div 
                key={order._id} 
                className="order-card modern-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="order-header">
                  <div className="order-id">
                    <i className="fas fa-receipt"></i>
                    <span>Order #{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div 
                    className="order-status"
                    style={{ color: getStatusColor(order.isDelivered) }}
                  >
                    <i className={getStatusIcon(order.isDelivered)}></i>
                    <span>{getStatusText(order.isDelivered)}</span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-info">
                    <div className="info-row">
                      <div className="info-label">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Order Date</span>
                      </div>
                      <div className="info-value">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-label">
                        <i className="fas fa-rupee-sign"></i>
                        <span>Total Amount</span>
                      </div>
                      <div className="info-value total-amount">
                        ₹{order.totalPrice.toFixed(2)}
                      </div>
                    </div>

                    {order.shippingAddress && (
                      <div className="info-row">
                        <div className="info-label">
                          <i className="fas fa-map-marker-alt"></i>
                          <span>Shipping Address</span>
                        </div>
                        <div className="info-value address">
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="order-actions">
                    <button className="btn-secondary">
                      <i className="fas fa-eye"></i>
                      View Details
                    </button>
                    {!order.isDelivered && (
                      <button className="btn-primary">
                        <i className="fas fa-truck"></i>
                        Track Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;