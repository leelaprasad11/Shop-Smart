import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      localStorage.setItem('token', data.token);
      
      // Dispatch custom event to notify navbar about auth state change
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isLoggedIn: true, token: data.token } 
      }));
      
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade-in">
        <div className="auth-header">
          <div className="auth-icon">
            <i className="fas fa-user-plus"></i>
          </div>
          <h2 className="auth-title">Join SmartShop!</h2>
          <p className="auth-subtitle">Create your account and start shopping today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-user"></i>
              Full Name
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="modern-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="modern-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-lock"></i>
              Password
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="modern-input"
              placeholder="Create a strong password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="auth-submit-btn btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Create Account
              </>
            )}
          </button>

          {error && (
            <div className="message error animate-fade-in">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">Already have an account?</p>
          <Link to="/login" className="auth-link btn-secondary">
            <i className="fas fa-sign-in-alt"></i>
            Sign In
          </Link>
        </div>

        <div className="auth-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Register; 