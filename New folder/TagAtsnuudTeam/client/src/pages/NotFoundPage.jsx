import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="content">
          <h1>404</h1>
          <h2>Хуудас олдсонгүй</h2>
          <p>Таны хайсан хуудас байхгүй эсвэл шилжсэн байна.</p>
          <Link to="/" className="home-link">Нүүр рүү буцах</Link>
        </div>
      </div>

      <style>{`
        .not-found-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 200px);
          background: linear-gradient(135deg, #f7941d 0%, #e86f1b 55%, #b95613 100%);
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
          font-weight: 800;
        }

        .content h2 {
          font-size: 32px;
          margin: 10px 0 15px 0;
          font-weight: 800;
        }

        .content p {
          font-size: 18px;
          margin: 0 0 30px 0;
          color: white;
        }

        .home-link {
          display: inline-block;
          background: white;
          color: var(--color-primary-hover);
          padding: 12px 30px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .content h1 {
            font-size: 80px;
          }

          .content h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
