import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (TokenManager.isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  React.useEffect(() => {
    apiClient.get('/auth/admin-exists')
      .then((response) => {
        const exists = Boolean(response.data?.data?.exists);
        setAdminExists(exists);
        setFormData((prev) => ({
          ...prev,
          role: exists ? 'USER' : 'ADMIN',
        }));
      })
      .catch(() => setAdminExists(true));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Бүх талбарыг бөглөнө үү');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байна');
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
      await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });

      TokenManager.clearTokens();
      navigate('/login', {
        state: {
          success: 'Бүртгэл амжилттай. Одоо имэйл, нууц үгээрээ нэвтэрнэ үү.',
        },
      });
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

          <div className="role-summary">
            <span>Бүртгэлийн эрх</span>
            <strong>{adminExists ? 'Хэрэглэгч' : 'Анхны админ'}</strong>
            <p>
              {adminExists
                ? 'Owner account-ийг админ самбараас нэмнэ.'
                : 'Системийн эхний бүртгэл тул энэ account админ болно.'}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="password">Нууц үг</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="6-аас дээш тэмдэгттэй нууц үг"
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
          background: var(--color-page);
          padding: 20px;
        }

        .register-box {
          background: white;
          padding: 36px;
          border-radius: 8px;
          box-shadow: var(--shadow-card);
          border: 1px solid var(--color-border);
          width: 100%;
          max-width: 430px;
        }

        .register-box h1 {
          text-align: center;
          margin-bottom: 26px;
          color: var(--color-text);
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 18px;
          border: 1px solid #f5c6cb;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--color-text);
          font-weight: 700;
        }

        .form-group input {
          width: 100%;
          padding: 11px;
          border: 1px solid var(--color-border-strong);
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(232, 111, 27, 0.14);
        }

        .role-summary {
          padding: 12px;
          border: 1px solid var(--color-border-strong);
          border-radius: 6px;
          background: var(--color-surface);
          margin-bottom: 18px;
        }

        .role-summary span {
          display: block;
          color: var(--color-muted);
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .role-summary strong {
          display: block;
          color: var(--color-primary-hover);
          font-size: 16px;
          margin-bottom: 4px;
        }

        .role-summary p {
          margin: 0;
          color: var(--color-muted);
          font-size: 13px;
          line-height: 1.4;
        }

        button {
          width: 100%;
          padding: 12px;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
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

        .login-link {
          text-align: center;
          margin-top: 20px;
          color: var(--color-muted);
        }

        .login-link a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 700;
        }

        .login-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .register-box {
            padding: 24px;
          }

        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
