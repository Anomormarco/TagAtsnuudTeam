import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (TokenManager.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Имэйл болон нууц үг заавал оруулна уу');
        setLoading(false);
        return;
      }

      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      TokenManager.setTokens(response.data.data.accessToken);
      TokenManager.setUser(response.data.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Нэвтрэх</h1>

        {location.state?.success && <div className="success-message">{location.state.success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Имэйл</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Имэйл хаягаа оруулна уу"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Нууц үг</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Нууц үгээ оруулна уу"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>

        <p className="signup-link">
          Бүртгэлгүй юу? <Link to="/register">Энд бүртгүүлнэ үү</Link>
        </p>
      </div>

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 24px;
          background: linear-gradient(135deg, #f7941d 0%, #e86f1b 55%, #b95613 100%);
        }

        .login-box {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
        }

        .login-box h1 {
          text-align: center;
          margin-bottom: 30px;
          color: var(--color-text);
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }

        .success-message {
          background-color: #e5f6ea;
          color: #1f6b35;
          padding: 12px;
          border-radius: 5px;
          margin-bottom: 20px;
          border: 1px solid #b9e7c8;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--color-text);
          font-weight: 700;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--color-border-strong);
          border-radius: 5px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(232, 111, 27, 0.14);
        }

        button {
          width: 100%;
          padding: 12px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        button:hover {
          background-color: var(--color-primary-hover);
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .signup-link {
          text-align: center;
          margin-top: 20px;
          color: var(--color-muted);
        }

        .signup-link a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 700;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
