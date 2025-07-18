import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
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

  if (!user) return null;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return 'fas fa-crown';
      case 'seller':
        return 'fas fa-store';
      default:
        return 'fas fa-user';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#ffd700';
      case 'seller':
        return '#667eea';
      default:
        return '#2d8f4e';
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content glass animate-fade-in">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <h2 className="profile-title">User Profile</h2>
          <p className="profile-subtitle">Welcome to your personal dashboard</p>
        </div>

        <div className="profile-details modern-card">
          <div className="profile-section">
            <h3 className="section-title">
              <i className="fas fa-info-circle"></i>
              Personal Information
            </h3>
            
            <div className="info-grid">
              <div className="info-item">
                <div className="info-label">
                  <i className="fas fa-user"></i>
                  <span>Full Name</span>
                </div>
                <div className="info-value">{user.name}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <i className="fas fa-envelope"></i>
                  <span>Email Address</span>
                </div>
                <div className="info-value">{user.email}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <i className={getRoleIcon(user.role)} style={{ color: getRoleColor(user.role) }}></i>
                  <span>Account Role</span>
                </div>
                <div className="info-value">
                  <span 
                    className="role-badge"
                    style={{ 
                      background: `linear-gradient(45deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}80)` 
                    }}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Member Since</span>
                </div>
                <div className="info-value">
                  {new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-primary">
              <i className="fas fa-edit"></i>
              Edit Profile
            </button>
            <button className="btn-secondary">
              <i className="fas fa-key"></i>
              Change Password
            </button>
            <button 
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>

        <div className="profile-stats modern-card">
          <h3 className="section-title">
            <i className="fas fa-chart-bar"></i>
            Account Statistics
          </h3>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">0</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-heart"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">0</div>
                <div className="stat-label">Wishlist Items</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-star"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">0</div>
                <div className="stat-label">Reviews Given</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">New</div>
                <div className="stat-label">Account Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 