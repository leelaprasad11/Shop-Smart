import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const formStyle = {
  maxWidth: 500,
  margin: '2rem auto',
  padding: '2rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  background: '#fff',
};
const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  margin: '0.5rem 0 1rem 0',
  borderRadius: '4px',
  border: '1px solid #ccc',
};
const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  background: '#2d8f4e',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const Checkout = () => {
  const [shipping, setShipping] = useState({ address: '', city: '', state: '', postalCode: '', country: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleChange = e => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderItems: cart.map(item => ({
            product: item.productId,
            name: item.name,
            qty: item.qty,
            price: item.price
          })),
          shippingAddress: shipping,
          paymentMethod,
          totalPrice: total
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order failed');
      localStorage.removeItem('cart');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={formStyle}>
        <h2>Order Placed!</h2>
        <p>Thank you for your purchase. Your order has been placed successfully.</p>
        <button style={buttonStyle} onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div style={formStyle}>
      <h2>Checkout</h2>
      <h4>Order Summary</h4>
      {cart.length === 0 ? <p>Your cart is empty.</p> : (
        <ul>
          {cart.map(item => (
            <li key={item.productId}>{item.name} x {item.qty} = ₹{(item.price * item.qty).toFixed(2)}</li>
          ))}
        </ul>
      )}
      <h4>Total: ₹{total.toFixed(2)}</h4>
      <form onSubmit={handleSubmit}>
        <h4>Shipping Address</h4>
        <input name="address" placeholder="Address" value={shipping.address} onChange={handleChange} required style={inputStyle} />
        <input name="city" placeholder="City" value={shipping.city} onChange={handleChange} required style={inputStyle} />
        <input name="state" placeholder="State/Province" value={shipping.state} onChange={handleChange} style={inputStyle} />
        <input name="postalCode" placeholder="Postal Code" value={shipping.postalCode} onChange={handleChange} required style={inputStyle} />
        <input name="country" placeholder="Country" value={shipping.country} onChange={handleChange} required style={inputStyle} />
        <h4>Payment Method</h4>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={inputStyle}>
          <option>Cash on Delivery</option>
          <option>Credit Card (not implemented)</option>
        </select>
        <button type="submit" style={buttonStyle} disabled={loading || cart.length === 0}>{loading ? 'Placing Order...' : 'Place Order'}</button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
};

export default Checkout; 