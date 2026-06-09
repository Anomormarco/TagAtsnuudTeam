import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

/**
 * Register Page - Day 2 & Day 3 Update
 */
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (TokenManager.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const passwordRegex = /^.{8,}$/;

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Бүх талбарыг бөглөнө үү');
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      setError('Нууц үг хамгийн багадаа 8 тэмдэгт байна');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Нууц үг таарахгүй байна');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      TokenManager.setTokens(response.data.data.accessToken);
      TokenManager.setUser(response.data.data.user);

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Бүртгүүлэхэд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Бүртгүүлэх</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Овог нэр</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Овог нэрээ оруулна уу"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Имэйл</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Имэйл хаягаа оруулна уу"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Нууц үг</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8-аас дээш тэмдэгттэй нууц үг"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Нууц үг давтах</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Нууц үгээ давтан оруулна уу"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
          </button>
        </form>

        <p className="login-link">
          Бүртгэлтэй юу? <Link to="/login">Энд нэвтэрнэ үү</Link>
        </p>
      </div>

      <style>{`
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f7941d 0%, #e86f1b 55%, #b95613 100%);
          padding: 20px;
        }

        .register-box {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
        }

        .register-box h1 {
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

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--color-text);
          font-weight: 500;
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
          font-weight: 600;
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

        .login-link {
          text-align: center;
          margin-top: 20px;
          color: var(--color-muted);
        }

        .login-link a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .login-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
