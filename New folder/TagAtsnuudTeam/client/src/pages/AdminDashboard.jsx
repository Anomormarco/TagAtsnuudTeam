import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';

const emptyOwnerForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [owners, setOwners] = useState([]);
  const [ownerForm, setOwnerForm] = useState(emptyOwnerForm);
  const [savingOwner, setSavingOwner] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    const [dashboardResponse, ownersResponse] = await Promise.all([
      apiClient.get('/dashboard/admin'),
      apiClient.get('/auth/owners'),
    ]);
    setStats(dashboardResponse.data);
    setOwners(ownersResponse.data?.data || []);
  };

  useEffect(() => {
    loadDashboard().catch(() => {
      setStats({
        totalUsers: 0,
        totalBookings: 0,
        totalHalls: 0,
        paidRevenue: 0,
        platformRevenue: 0,
        recentPayments: [],
        recentPayouts: [],
      });
      setOwners([]);
      setError('Админ самбарын мэдээлэл ачаалахад алдаа гарлаа');
    });
  }, []);

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerForm((prev) => ({ ...prev, [name]: value }));
  };

  const createOwner = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (ownerForm.password !== ownerForm.confirmPassword) {
      setError('Owner-ийн нууц үг таарахгүй байна');
      return;
    }

    setSavingOwner(true);
    try {
      await apiClient.post('/auth/owners', ownerForm);
      setOwnerForm(emptyOwnerForm);
      setNotice('Owner account амжилттай үүслээ');
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Owner үүсгэхэд алдаа гарлаа');
    } finally {
      setSavingOwner(false);
    }
  };

  if (!stats) {
    return <div className="admin-dashboard"><div className="container">Ачаалж байна...</div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="page-heading">
          <p className="eyebrow">Админ хэсэг</p>
          <h1>Системийн удирдлага</h1>
        </div>

        {(notice || error) && (
          <div className={error ? 'notice error' : 'notice success'}>
            {error || notice}
          </div>
        )}

        <div className="metrics-grid">
          <div className="metric-card">
            <span>Нийт хэрэглэгч</span>
            <strong>{stats.totalUsers || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Owner</span>
            <strong>{owners.length}</strong>
          </div>
          <div className="metric-card">
            <span>Нийт заал</span>
            <strong>{stats.totalHalls || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Нийт захиалга</span>
            <strong>{stats.totalBookings || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Төлөгдсөн орлого</span>
            <strong>₮{Number(stats.paidRevenue || 0).toLocaleString()}</strong>
          </div>
          <div className="metric-card">
            <span>Платформ шимтгэл</span>
            <strong>₮{Number(stats.platformRevenue || 0).toLocaleString()}</strong>
          </div>
        </div>

        <div className="admin-grid">
          <section className="panel">
            <div className="section-header">
              <h2>Owner нэмэх</h2>
              <span>Admin эрхээр үүсгэнэ</span>
            </div>

            <form className="owner-form" onSubmit={createOwner}>
              <label>
                Нэр
                <input name="name" value={ownerForm.name} onChange={handleOwnerChange} required />
              </label>
              <label>
                Имэйл
                <input type="email" name="email" value={ownerForm.email} onChange={handleOwnerChange} required />
              </label>
              <div className="form-row">
                <label>
                  Нууц үг
                  <input type="password" name="password" minLength="6" value={ownerForm.password} onChange={handleOwnerChange} required />
                </label>
                <label>
                  Давтах
                  <input type="password" name="confirmPassword" minLength="6" value={ownerForm.confirmPassword} onChange={handleOwnerChange} required />
                </label>
              </div>
              <button type="submit" disabled={savingOwner}>
                {savingOwner ? 'Үүсгэж байна...' : 'Owner үүсгэх'}
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="section-header">
              <h2>Owner жагсаалт</h2>
              <span>{owners.length} owner</span>
            </div>

            <div className="owner-list">
              {owners.length ? owners.map((owner) => (
                <div className="owner-row" key={owner.id}>
                  <div>
                    <strong>{owner.name}</strong>
                    <p>{owner.email}</p>
                  </div>
                  <span>{owner.role}</span>
                </div>
              )) : (
                <div className="empty-state">Owner account одоогоор алга.</div>
              )}
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="section-header">
            <h2>Сүүлийн төлбөрүүд</h2>
          </div>

          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Захиалга</th>
                  <th>Заал</th>
                  <th>Дүн</th>
                  <th>Төлөв</th>
                  <th>Огноо</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentPayments || []).length ? stats.recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>#{payment.bookingId}</td>
                    <td>{payment.hallName || 'Заал'}</td>
                    <td>₮{Number(payment.amount || 0).toLocaleString()}</td>
                    <td><span className="badge">{payment.status}</span></td>
                    <td>{new Date(payment.createdAt).toLocaleDateString('mn-MN')}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="empty-cell">Төлбөрийн мэдээлэл алга.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style>{`
        .admin-dashboard {
          padding: 30px 0;
          background: var(--color-page);
          min-height: calc(100vh - 200px);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .page-heading {
          margin-bottom: 22px;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: var(--color-primary-hover);
          font-weight: 800;
          font-size: 13px;
        }

        h1, h2, p {
          margin-top: 0;
        }

        h1 {
          color: var(--color-text);
          font-size: 30px;
          margin-bottom: 0;
        }

        .notice {
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
          font-weight: 700;
        }

        .notice.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .notice.success {
          background: #e5f6ea;
          color: #1f6b35;
          border: 1px solid #b9e7c8;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .metric-card,
        .panel {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: var(--shadow-card);
        }

        .metric-card {
          padding: 18px;
          border-top: 4px solid var(--color-primary);
        }

        .metric-card span {
          display: block;
          color: var(--color-muted);
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .metric-card strong {
          display: block;
          color: var(--color-text);
          font-size: 22px;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 22px;
          margin-bottom: 22px;
          align-items: start;
        }

        .panel {
          padding: 22px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .section-header h2 {
          margin: 0;
          color: var(--color-text);
          font-size: 20px;
        }

        .section-header span {
          color: var(--color-primary-hover);
          font-size: 13px;
          font-weight: 800;
        }

        .owner-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .owner-form label {
          color: var(--color-text);
          font-size: 13px;
          font-weight: 800;
        }

        .owner-form input {
          width: 100%;
          margin-top: 7px;
          padding: 11px;
          border: 1px solid var(--color-border-strong);
          border-radius: 6px;
          font: inherit;
        }

        .owner-form input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(232, 111, 27, 0.14);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .owner-form button {
          border: none;
          border-radius: 6px;
          background: var(--color-primary);
          color: white;
          padding: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .owner-form button:hover {
          background: var(--color-primary-hover);
        }

        .owner-form button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .owner-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .owner-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding: 13px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-surface);
        }

        .owner-row strong {
          color: var(--color-text);
        }

        .owner-row p {
          margin: 5px 0 0;
          color: var(--color-muted);
          font-size: 13px;
        }

        .owner-row span,
        .badge {
          background: var(--color-primary-soft);
          color: var(--color-primary-hover);
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 12px;
          font-weight: 800;
        }

        .payments-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 13px;
          text-align: left;
          border-bottom: 1px solid var(--color-border);
        }

        th {
          background: var(--color-primary-soft);
          color: var(--color-muted);
          font-size: 12px;
          font-weight: 800;
        }

        .empty-state,
        .empty-cell {
          padding: 24px;
          text-align: center;
          color: var(--color-muted);
          background: var(--color-surface-warm);
          border-radius: 8px;
        }

        @media (max-width: 1000px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .admin-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .metrics-grid,
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
