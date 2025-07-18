import React from 'react';

const Footer = () => {
  return (
    <footer className="footer glass">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-brand">
            <i className="fas fa-shopping-basket"></i>
            <h3>Shop Smart</h3>
          </div>
          <p className="footer-description">
            Your one-stop destination for quality products and exceptional shopping experience.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Contact</h4>
          <p className="contact-info">
            <i className="fas fa-envelope"></i>
            <a href="mailto:shopsmart@gmail.com">shopsmart@gmail.com</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 Shop Smart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 