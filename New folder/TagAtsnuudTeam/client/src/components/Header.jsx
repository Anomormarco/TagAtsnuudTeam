import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TokenManager from '../utils/tokenManager';

/**
 * Header Navigation Component
 * Modern responsive header with navigation, search, user menu
 */
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
            <span className="logo-icon">🏛️</span>
            <span className="logo-text">HallBook</span>
          </Link>
        </div>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search halls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        <nav className="nav-links">
          <Link to="/" className="nav-link">Halls</Link>
          {user ? (
            <>
              <Link to="/bookings" className="nav-link">My Bookings</Link>
              <div className="user-menu">
                <button 
                  className="user-button"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  👤 {user.name}
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="menu-item">Profile</Link>
                    {(user.role === 'owner' || user.role === 'admin') && (
                      <button 
                        className="menu-item"
                        onClick={handleDashboardClick}
                      >
                        Dashboard
                      </button>
                    )}
                    <button 
                      className="menu-item logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn-primary">Register</Link>
            </>
          )}
        </nav>

        <button className="mobile-menu-btn">☰</button>
      </div>

      <style>{`
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          gap: 30px;
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
          color: white;
          font-size: 24px;
          font-weight: bold;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          letter-spacing: 0.5px;
        }

        .search-box {
          flex: 1;
          min-width: 200px;
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 15px;
          border-radius: 25px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          outline: none;
        }

        .search-box input::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }

        .search-box button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 5px;
          transition: background 0.3s;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-link.btn-primary {
          background: rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .nav-link.btn-primary:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .user-menu {
          position: relative;
        }

        .user-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .user-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          margin-top: 8px;
          min-width: 180px;
          overflow: hidden;
          z-index: 200;
        }

        .menu-item {
          display: block;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          color: #333;
          text-decoration: none;
          transition: background 0.3s;
          font-size: 14px;
        }

        .menu-item:hover {
          background: #f5f5f5;
        }

        .menu-item.logout {
          color: #dc3545;
          border-top: 1px solid #eee;
        }

        .menu-item.logout:hover {
          background: #fff5f5;
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .header-container {
            gap: 15px;
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
