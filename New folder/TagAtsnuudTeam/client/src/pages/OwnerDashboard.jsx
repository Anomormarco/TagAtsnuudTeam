import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

const emptyForm = {
  name: '',
  location: '',
  capacity: '',
  pricePerHour: '',
  imageUrl: '',
  description: '',
};

const fallbackImage = 'http://localhost:3000/uploads/halls/page1-hall-01.png';

const OwnerDashboard = () => {
  const user = TokenManager.getUser();
  const ownerId = user?.id;
  const [activeView, setActiveView] = useState('halls');
  const [stats, setStats] = useState(null);
  const [halls, setHalls] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requestHeaders = useMemo(() => ({
    'x-user-id': ownerId,
    'x-user-role': user?.role || 'OWNER',
  }), [ownerId, user?.role]);

  const fetchDashboard = async () => {
    if (!ownerId) return;
    const dashboardResponse = await apiClient.get(`/dashboard/owner/${ownerId}`);
    setStats(dashboardResponse.data);
  };

  const fetchHalls = async () => {
    if (!ownerId) return;
    const hallsResponse = await apiClient.get('/halls', {
      params: { ownerId, size: 100, sort: 'created_at,desc' },
    });
    setHalls(hallsResponse.data?.data?.content || []);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      await Promise.all([fetchDashboard(), fetchHalls()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Самбарын мэдээлэл ачаалахад алдаа гарлаа');
      setStats({
        totalHalls: 0,
        totalBookings: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
        payments: [],
        payouts: [],
        halfMonthRentals: [],
      });
      setHalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ownerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateHall = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/halls', {
        ownerId,
        name: formData.name,
        location: formData.location,
        capacity: Number(formData.capacity),
        pricePerHour: Number(formData.pricePerHour),
        imageUrl: formData.imageUrl || fallbackImage,
        description: formData.description,
        status: 'AVAILABLE',
      }, { headers: requestHeaders });

      setFormData(emptyForm);
      setSuccess('Заал амжилттай нэмэгдлээ');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Заал нэмэхэд алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHall = async (hallId) => {
    setError('');
    setSuccess('');

    try {
      await apiClient.delete(`/halls/${hallId}`, { headers: requestHeaders });
      setSuccess('Заал устгагдлаа');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Заал устгахад алдаа гарлаа');
    }
  };

  const rentals = stats?.halfMonthRentals || [];
  const rentalTotal = rentals.reduce((sum, rental) => sum + Number(rental.ownerAmount || rental.totalPrice || 0), 0);

  if (loading) {
    return <div className="owner-dashboard"><div className="container">Ачаалж байна...</div></div>;
  }

  return (
    <div className="owner-dashboard">
      <div className="container">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Эзэмшигчийн хэсэг</p>
            <h1>Заал удирдлага</h1>
          </div>
          <div className="view-switch">
            <button className={activeView === 'halls' ? 'active' : ''} onClick={() => setActiveView('halls')}>
              Миний заалууд
            </button>
            <button className={activeView === 'rentals' ? 'active' : ''} onClick={() => setActiveView('rentals')}>
              14 хоногийн түрээс
            </button>
          </div>
        </div>

        {(error || success) && (
          <div className={error ? 'notice error' : 'notice success'}>
            {error || success}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <span>Миний заал</span>
            <strong>{halls.length || stats?.totalHalls || 0}</strong>
          </div>
          <div className="stat-card">
            <span>Нийт захиалга</span>
            <strong>{stats?.totalBookings || 0}</strong>
          </div>
          <div className="stat-card">
            <span>Төлөгдсөн орлого</span>
            <strong>₮{Number(stats?.paidRevenue || 0).toLocaleString()}</strong>
          </div>
          <div className="stat-card">
            <span>14 хоногийн түрээс</span>
            <strong>{rentals.length}</strong>
          </div>
        </div>

        {activeView === 'halls' ? (
          <div className="dashboard-grid">
            <section className="panel">
              <div className="section-header">
                <h2>Миний заалууд</h2>
                <span>{halls.length} заал</span>
              </div>

              <div className="hall-list">
                {halls.length ? halls.map((hall) => (
                  <article className="hall-row" key={hall.id}>
                    <img src={hall.imageUrl || fallbackImage} alt={hall.name} />
                    <div className="hall-main">
                      <h3>{hall.name}</h3>
                      <p>{hall.location}</p>
                      <div className="hall-meta">
                        <span>{hall.capacity} хүн</span>
                        <span>₮{Number(hall.pricePerHour || 0).toLocaleString()}/цаг</span>
                        <span>{hall.status === 'AVAILABLE' ? 'Идэвхтэй' : hall.status}</span>
                      </div>
                    </div>
                    <button className="danger-btn" onClick={() => handleDeleteHall(hall.id)}>
                      Устгах
                    </button>
                  </article>
                )) : (
                  <div className="empty-state">Одоогоор нэмсэн заал алга.</div>
                )}
              </div>
            </section>

            <section className="panel">
              <h2>Шинэ заал нэмэх</h2>
              <form className="hall-form" onSubmit={handleCreateHall}>
                <label>
                  Заалны нэр
                  <input name="name" value={formData.name} onChange={handleChange} required />
                </label>
                <label>
                  Байршил
                  <input name="location" value={formData.location} onChange={handleChange} required />
                </label>
                <div className="form-row">
                  <label>
                    Багтаамж
                    <input name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} required />
                  </label>
                  <label>
                    Үнэ / цаг
                    <input name="pricePerHour" type="number" min="0" value={formData.pricePerHour} onChange={handleChange} required />
                  </label>
                </div>
                <label>
                  Зургийн URL
                  <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder={fallbackImage} />
                </label>
                <label>
                  Тайлбар
                  <textarea name="description" rows="4" value={formData.description} onChange={handleChange} />
                </label>
                <button className="primary-btn" type="submit" disabled={saving}>
                  {saving ? 'Нэмж байна...' : 'Заал нэмэх'}
                </button>
              </form>
            </section>
          </div>
        ) : (
          <section className="panel">
            <div className="section-header">
              <div>
                <h2>Дараагийн 14 хоногийн түрээс</h2>
                <p>Өнөөдрөөс эхлээд ирэх 14 хоногт захиалагдсан заалууд.</p>
              </div>
              <strong>₮{rentalTotal.toLocaleString()}</strong>
            </div>

            <div className="rentals-table">
              <table>
                <thead>
                  <tr>
                    <th>Заал</th>
                    <th>Эхлэх</th>
                    <th>Дуусах</th>
                    <th>Дүн</th>
                    <th>Төлөв</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.length ? rentals.map((rental) => (
                    <tr key={rental.id}>
                      <td>{rental.hallName}</td>
                      <td>{new Date(rental.startTime).toLocaleString('mn-MN')}</td>
                      <td>{new Date(rental.endTime).toLocaleString('mn-MN')}</td>
                      <td>₮{Number(rental.ownerAmount || rental.totalPrice || 0).toLocaleString()}</td>
                      <td><span className="status-pill">{rental.paymentStatus || rental.status}</span></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="empty-cell">14 хоногт захиалга алга.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <style>{`
        .owner-dashboard {
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
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 18px;
          margin-bottom: 22px;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: var(--color-primary-hover);
          font-weight: 800;
          font-size: 13px;
        }

        h1, h2, h3, p {
          margin-top: 0;
        }

        .owner-dashboard h1 {
          font-size: 30px;
          color: var(--color-text);
          margin-bottom: 0;
        }

        .view-switch {
          display: flex;
          gap: 8px;
          padding: 6px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: white;
        }

        .view-switch button {
          border: none;
          background: transparent;
          color: var(--color-text);
          border-radius: 6px;
          padding: 10px 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .view-switch button.active {
          background: var(--color-primary);
          color: white;
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }

        .stat-card,
        .panel {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: var(--shadow-card);
        }

        .stat-card {
          padding: 18px;
          border-top: 4px solid var(--color-primary);
        }

        .stat-card span {
          display: block;
          color: var(--color-muted);
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .stat-card strong {
          display: block;
          color: var(--color-text);
          font-size: 24px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
          gap: 22px;
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
          margin-bottom: 0;
          color: var(--color-text);
          font-size: 20px;
        }

        .section-header p {
          margin: 5px 0 0;
          color: var(--color-muted);
          font-size: 13px;
        }

        .section-header span,
        .section-header strong {
          color: var(--color-primary-hover);
          font-weight: 800;
        }

        .hall-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hall-row {
          display: grid;
          grid-template-columns: 104px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          padding: 12px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-surface);
        }

        .hall-row img {
          width: 104px;
          height: 76px;
          object-fit: cover;
          border-radius: 6px;
          background: var(--color-primary-soft);
        }

        .hall-main h3 {
          margin: 0 0 6px;
          font-size: 17px;
          color: var(--color-text);
        }

        .hall-main p {
          margin: 0 0 9px;
          color: var(--color-muted);
          font-size: 13px;
        }

        .hall-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .hall-meta span,
        .status-pill {
          background: var(--color-primary-soft);
          color: var(--color-primary-hover);
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 12px;
          font-weight: 800;
        }

        .danger-btn,
        .primary-btn {
          border: none;
          border-radius: 6px;
          padding: 10px 13px;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .danger-btn {
          background: var(--color-danger);
        }

        .primary-btn {
          width: 100%;
          background: var(--color-primary);
        }

        .primary-btn:hover {
          background: var(--color-primary-hover);
        }

        .danger-btn:hover {
          background: #8f2e20;
        }

        .hall-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .hall-form label {
          color: var(--color-text);
          font-weight: 800;
          font-size: 13px;
        }

        .hall-form input,
        .hall-form textarea {
          width: 100%;
          margin-top: 7px;
          padding: 11px;
          border: 1px solid var(--color-border-strong);
          border-radius: 6px;
          font: inherit;
          resize: vertical;
        }

        .hall-form input:focus,
        .hall-form textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(232, 111, 27, 0.14);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .rentals-table {
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
          padding: 28px;
          text-align: center;
          color: var(--color-muted);
          background: var(--color-surface-warm);
          border-radius: 8px;
        }

        @media (max-width: 900px) {
          .stats-grid,
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .page-heading {
            align-items: stretch;
            flex-direction: column;
          }
        }

        @media (max-width: 560px) {
          .view-switch,
          .form-row {
            grid-template-columns: 1fr;
            display: grid;
          }

          .hall-row {
            grid-template-columns: 88px minmax(0, 1fr);
          }

          .hall-row img {
            width: 88px;
            height: 68px;
          }

          .danger-btn {
            grid-column: 1 / -1;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
