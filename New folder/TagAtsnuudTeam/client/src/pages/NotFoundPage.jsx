import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Not Found Page (404)
 * Displayed when user navigates to non-existent routes
 */
const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>Sorry, the page you're looking for doesn't exist.</p>
          <Link to="/" className="home-link">
            ← Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        .not-found-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .container {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .content {
          text-align: center;
          color: white;
        }

        .content h1 {
          font-size: 120px;
          margin: 0;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .content h2 {
          font-size: 32px;
          margin: 10px 0 15px 0;
          font-weight: 600;
        }

        .content p {
          font-size: 18px;
          margin: 0 0 30px 0;
          opacity: 0.9;
        }

        .home-link {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 12px 30px;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }

        .home-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .content h1 {
            font-size: 80px;
          }

          .content h2 {
            font-size: 24px;
          }

          .content p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
