import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TokenManager from '../utils/tokenManager';

const Header = ({ user, setUser }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    TokenManager.clearTokens();
    setUser(null);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleDashboardClick = () => {
    const userInfo = TokenManager.getUser();
    if (userInfo?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (userInfo?.role === 'owner') {
      navigate('/owner/dashboard');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">Z</span>
            <span className="logo-text">Заал</span>
          </Link>
        </div>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Заалнаас хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Хайх</button>
        </form>

        <nav className="nav-links">
          <Link to="/" className="nav-link">Заалууд</Link>
          {user ? (
            <>
              <Link to="/bookings" className="nav-link">Миний захиалга</Link>
              <div className="user-menu">
                <button className="user-button" onClick={() => setShowMenu(!showMenu)}>
                  {user.name}
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="menu-item">Профайл</Link>
                    {(user.role === 'owner' || user.role === 'admin') && (
                      <button className="menu-item" onClick={handleDashboardClick}>
                        Самбар
                      </button>
                    )}
                    <button className="menu-item logout" onClick={handleLogout}>
                      Гарах
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Нэвтрэх</Link>
              <Link to="/register" className="nav-link btn-primary">Бүртгүүлэх</Link>
            </>
          )}
        </nav>

        <button className="mobile-menu-btn">☰</button>
      </div>

      <style>{`
        .header {
          background: var(--color-surface);
          color: var(--color-text);
          padding: 0.85rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid var(--color-border);
          box-shadow: 0 6px 20px rgba(89, 48, 12, 0.06);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .logo {
          flex-shrink: 0;
        }

        .logo a {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--color-text);
          font-size: 24px;
          font-weight: 800;
        }

        .logo-icon {
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--color-primary);
          color: white;
          font-size: 20px;
          font-weight: 800;
        }

        .logo-text {
          letter-spacing: 0;
        }

        .search-box {
          flex: 1;
          min-width: 240px;
          display: flex;
          gap: 8px;
          background: var(--color-page);
          padding: 8px;
          border-radius: 8px;
          border: 1px solid var(--color-border-strong);
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--color-text);
          font-size: 14px;
          outline: none;
          padding: 0 8px;
        }

        .search-box input::placeholder {
          color: var(--color-muted);
        }

        .search-box button {
          background: var(--color-primary);
          border: none;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          border-radius: 6px;
          padding: 8px 14px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .nav-link {
          color: var(--color-text);
          text-decoration: none;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background 0.2s, color 0.2s;
        }

        .nav-link:hover {
          background: var(--color-primary-soft);
          color: var(--color-primary-hover);
        }

        .nav-link.btn-primary {
          background: var(--color-primary);
          border: 1px solid var(--color-primary);
          color: white;
        }

        .nav-link.btn-primary:hover {
          background: var(--color-primary-hover);
          color: white;
        }

        .user-menu {
          position: relative;
        }

        .user-button {
          background: var(--color-primary-soft);
          color: var(--color-primary-hover);
          border: 1px solid var(--color-border-strong);
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: var(--shadow-card);
          margin-top: 8px;
          min-width: 180px;
          overflow: hidden;
          z-index: 200;
          border: 1px solid var(--color-border);
        }

        .menu-item {
          display: block;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          color: var(--color-text);
          text-decoration: none;
          font-size: 14px;
        }

        .menu-item:hover {
          background: var(--color-primary-soft);
        }

        .menu-item.logout {
          color: var(--color-danger);
          border-top: 1px solid var(--color-border);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--color-primary);
          font-size: 24px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .header-container {
            gap: 12px;
          }

          .search-box {
            order: 3;
            flex-basis: 100%;
            min-width: 100%;
          }

          .nav-links {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
            order: 2;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
