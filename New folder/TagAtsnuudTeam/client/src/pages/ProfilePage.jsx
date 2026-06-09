import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

/**
 * Profile Page - Day 2, Day 3 & Day 4 Update
 * Protected route - requires authentication
 */
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = TokenManager.getAccessToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.get('/auth/me');
      setUser(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      TokenManager.clearTokens();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed');
    }
  };

  const handleRoleRedirect = () => {
    const user = TokenManager.getUser();
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/bookings');
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading...</p></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h1>My Profile</h1>

        {error && <div className="error-message">{error}</div>}

        {user && (
          <div className="profile-content">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="profile-info">
              <div className="info-row">
                <label>Name:</label>
                <span>{user.name}</span>
              </div>

              <div className="info-row">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>

              {user.phone && (
                <div className="info-row">
                  <label>Phone:</label>
                  <span>{user.phone}</span>
                </div>
              )}

              <div className="info-row">
                <label>Role:</label>
                <span className="role-badge">{user.role}</span>
              </div>

              <div className="info-row">
                <label>Member Since:</label>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="profile-actions">
              {user.role !== 'user' && (
                <button className="dashboard-btn" onClick={handleRoleRedirect}>
                  Go to {user.role === 'admin' ? 'Admin' : 'Owner'} Dashboard
                </button>
              )}
              <button className="edit-btn">Edit Profile</button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .profile-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .profile-box {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 600px;
        }

        .profile-box h1 {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 5px;
          border: 1px solid #f5c6cb;
          margin-bottom: 20px;
        }

        .profile-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .profile-avatar {
          text-align: center;
        }

        .profile-avatar img,
        .avatar-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          margin: 0 auto;
        }

        .avatar-placeholder {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: bold;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }

        .info-row label {
          font-weight: 600;
          color: #333;
          width: 120px;
        }

        .info-row span {
          color: #666;
          flex: 1;
          text-align: right;
        }

        .role-badge {
          background-color: #667eea;
          color: white !important;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .profile-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .edit-btn,
        .logout-btn,
        .dashboard-btn {
          padding: 12px;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .dashboard-btn {
          background-color: #28a745;
          color: white;
        }

        .dashboard-btn:hover {
          background-color: #218838;
        }

        .edit-btn {
          background-color: #667eea;
          color: white;
        }

        .edit-btn:hover {
          background-color: #5568d3;
        }

        .logout-btn {
          background-color: #dc3545;
          color: white;
        }

        .logout-btn:hover {
          background-color: #c82333;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
