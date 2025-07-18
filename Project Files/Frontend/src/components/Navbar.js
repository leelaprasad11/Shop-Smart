import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setIsLoggedIn(true);
          setUserRole(data.role);
          setUserName(data.name);
        })
        .catch((error) => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        });
    }
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const handleAuthStateChange = async (event) => {
      if (event.detail.isLoggedIn) {
        const token = event.detail.token;
        try {
          const res = await fetch('http://localhost:5000/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setIsLoggedIn(true);
            setUserRole(data.role);
            setUserName(data.name);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    return () => window.removeEventListener('authStateChanged', handleAuthStateChange);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + item.qty, 0);
      setCartCount(count);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserRole('');
    setUserName('');
    
    // Dispatch custom event to notify about logout
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isLoggedIn: false } 
    }));
    
    navigate('/');
  };

  return (
    <nav className="navbar glass animate-fade-in">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <i className="fas fa-shopping-basket"></i>
          <span>Shop Smart</span>
        </Link>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          
          {isLoggedIn && (
            <>
              <Link to="/cart" className="nav-link cart-link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-shopping-cart"></i>
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              
              <Link to="/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-history"></i>
                <span>Orders</span>
              </Link>
              
              {(userRole === 'seller' || userRole === 'admin') && (
                <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-chart-line"></i>
                  <span>Dashboard</span>
                </Link>
              )}
              
              <div className="nav-user">
                <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-user-circle"></i>
                  <span>{userName}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
          
          {!isLoggedIn && (
            <div className="auth-buttons">
              <Link to="/login" className="btn-primary" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn-secondary" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-user-plus"></i>
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        <div 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 