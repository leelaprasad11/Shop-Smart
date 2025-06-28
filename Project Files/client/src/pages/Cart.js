import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQty = (productId, qty) => {
    const newCart = cart.map(item =>
      item.productId === productId ? { ...item, qty: Math.max(1, qty) } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.productId !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="cart-container">
      <div className="cart-content glass animate-fade-in">
        <div className="cart-header">
          <h2 className="cart-title">
            <i className="fas fa-shopping-cart"></i>
            Your Shopping Cart
          </h2>
          <p className="cart-subtitle">
            {cart.length === 0 ? 'Your cart is empty' : `${cart.length} item${cart.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <i className="fas fa-shopping-basket"></i>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-arrow-left"></i>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.productId} className="cart-item modern-card">
                <div className="item-image">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="image-placeholder">
                      <i className="fas fa-image"></i>
                    </div>
                  )}
                </div>
                
                <div className="item-details">
                  <h4 className="item-name">{item.name}</h4>
                  <p className="item-price">₹{item.price}</p>
                  
                  <div className="item-controls">
                    <div className="quantity-control">
                      <label>Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={e => updateQty(item.productId, Number(e.target.value))}
                        className="quantity-input"
                      />
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.productId)} 
                      className="remove-btn"
                    >
                      <i className="fas fa-trash"></i>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="cart-summary modern-card">
              <h3 className="total-title">
                <i className="fas fa-calculator"></i>
                Order Summary
              </h3>
              <div className="total-amount">
                <span>Total:</span>
                <span className="total-price">₹{total.toFixed(2)}</span>
              </div>
              <button
                className="checkout-btn btn-primary"
                onClick={() => navigate('/checkout')}
                disabled={cart.length === 0}
              >
                <i className="fas fa-credit-card"></i>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 