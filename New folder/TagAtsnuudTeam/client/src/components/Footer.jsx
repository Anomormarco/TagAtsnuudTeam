import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Заал</h4>
          <p>Спорт заал, хурлын танхим, арга хэмжээний заалыг хурдан хайж захиалах нэгдсэн систем.</p>
        </div>

        <div className="footer-section">
          <h4>Цэс</h4>
          <ul>
            <li><Link to="/">Заалууд</Link></li>
            <li><Link to="/bookings">Миний захиалга</Link></li>
            <li><Link to="/profile">Профайл</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Тусламж</h4>
          <ul>
            <li><Link to="#">Үйлчилгээний нөхцөл</Link></li>
            <li><Link to="#">Нууцлал</Link></li>
            <li><Link to="#">Холбоо барих</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Бидэнтэй нэгдээрэй</h4>
          <div className="social-links">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Заал. Бүх эрх хуулиар хамгаалагдсан.</p>
      </div>

      <style>{`
        .footer {
          background: #2b1b10;
          color: #f7eadc;
          padding: 40px 0 20px;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 28px;
        }

        .footer-section h4 {
          color: white;
          margin-bottom: 14px;
          font-size: 16px;
        }

        .footer-section p,
        .footer-section a {
          color: #d8c2aa;
          font-size: 14px;
          line-height: 1.6;
          text-decoration: none;
        }

        .footer-section a:hover {
          color: #ffb35f;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: 8px;
        }

        .social-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 28px auto 0;
          padding: 18px 20px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          text-align: center;
        }

        .footer-bottom p {
          color: #bca58c;
          font-size: 13px;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
