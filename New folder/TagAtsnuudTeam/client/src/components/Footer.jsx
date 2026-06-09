import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer Component
 * Application footer with links and info
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h4>About HallBook</h4>
          <p>Find and book beautiful halls for your events, meetings, and celebrations.</p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Browse Halls</Link></li>
            <li><Link to="/bookings">My Bookings</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Legal</h4>
          <ul>
            <li><Link to="#">Privacy Policy</Link></li>
            <li><Link to="#">Terms of Service</Link></li>
            <li><Link to="#">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} HallBook. All rights reserved.</p>
      </div>

      <style>{`
        .footer {
          background: #1a1a2e;
          color: #e0e0e0;
          margin-top: 60px;
          padding: 40px 0 20px;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .footer-column h4 {
          color: white;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }

        .footer-column p {
          font-size: 14px;
          line-height: 1.6;
          color: #b0b0b0;
        }

        .footer-column ul {
          list-style: none;
        }

        .footer-column ul li {
          margin-bottom: 10px;
        }

        .footer-column ul li a {
          color: #b0b0b0;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-column ul li a:hover {
          color: #667eea;
        }

        .social-links {
          display: flex;
          gap: 15px;
        }

        .social-links a {
          color: #b0b0b0;
          text-decoration: none;
          transition: color 0.3s;
        }

        .social-links a:hover {
          color: #667eea;
        }

        .footer-bottom {
          border-top: 1px solid #333;
          padding-top: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
