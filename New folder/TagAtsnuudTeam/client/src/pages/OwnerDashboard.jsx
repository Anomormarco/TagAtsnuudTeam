import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const ownerId = TokenManager.getUser()?.id || 6;
    apiClient.get(`/dashboard/owner/${ownerId}`)
      .then((response) => setStats(response.data))
      .catch(() => setStats({ totalHalls: 0, totalBookings: 0, paidRevenue: 0, pendingRevenue: 0, halls: [], payments: [] }));
  }, []);

  if (!stats) {
    return <div className="owner-dashboard"><div className="container">Ачаалж байна...</div></div>;
  }

  return (
    <div className="owner-dashboard">
      <div className="container">
        <h1>Эзэмшигчийн самбар</h1>

        <div className="stats-grid">
          <div className="stat-card"><h4>Миний заалууд</h4><p className="stat-value">{stats.totalHalls || 0}</p></div>
          <div className="stat-card"><h4>Нийт захиалга</h4><p className="stat-value">{stats.totalBookings || 0}</p></div>
          <div className="stat-card"><h4>Төлөгдсөн орлого</h4><p className="stat-value">₮{(Number(stats.paidRevenue || 0) / 1000000).toFixed(1)} сая</p></div>
          <div className="stat-card"><h4>Хүлээгдэж буй</h4><p className="stat-value">₮{(Number(stats.pendingRevenue || 0) / 1000000).toFixed(1)} сая</p></div>
        </div>

        <section className="section">
          <div className="section-header">
            <h2>Миний заалууд</h2>
            <button className="btn-primary">Шинэ заал нэмэх</button>
          </div>

          <div className="halls-table-container">
            <table className="halls-table">
              <thead>
                <tr>
                  <th>Заал</th>
                  <th>Захиалга</th>
                  <th>Орлого</th>
                  <th>Дүүргэлт</th>
                  <th>Төлөв</th>
                  <th>Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {(stats.halls || []).map((hall) => {
                  const occupancy = Math.min(Number(hall.bookings || 0) * 10, 100);
                  return (
                    <tr key={hall.id}>
                      <td><strong>{hall.name}</strong></td>
                      <td>{hall.bookings}</td>
                      <td>₮{Number(hall.earnings || 0).toLocaleString()}</td>
                      <td>
                        <div className="occupancy-bar">
                          <div className="occupancy-fill" style={{ width: `${occupancy}%` }} />
                          <span>{occupancy}%</span>
                        </div>
                      </td>
                      <td><span className="status-badge active">{hall.status === 'AVAILABLE' ? 'Идэвхтэй' : hall.status}</span></td>
                      <td>
                        <button className="btn-small">Засах</button>
                        <button className="btn-small">Захиалга харах</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section">
          <h2>Сүүлийн төлбөрүүд</h2>
          <div className="bookings-list">
            {(stats.payments || []).map((payment) => (
              <div key={payment.id} className="booking-item">
                <div className="booking-info">
                  <h4>{payment.hallName || 'Заалын захиалга'}</h4>
                  <p>Захиалга #{payment.bookingId} · {new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="booking-earnings">
                  <span className="earnings">₮{Number(payment.ownerAmount || 0).toLocaleString()}</span>
                  <span className="status">{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Шуурхай үйлдэл</h2>
          <div className="actions-grid">
            {['Зураг оруулах', 'Цагийн хуваарь', 'Төлбөрүүд', 'Тайлан харах'].map((item) => (
              <button key={item} className="action-card">{item}</button>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .owner-dashboard { padding: 30px 0; background: var(--color-page); min-height: calc(100vh - 200px); }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .owner-dashboard h1 { font-size: 28px; color: var(--color-text); margin-bottom: 24px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-bottom: 24px; }
        .stat-card, .section { background: white; border-radius: 8px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
        .stat-card { padding: 20px; border-top: 4px solid var(--color-primary); }
        .stat-card h4 { margin: 0; color: var(--color-muted); font-size: 12px; font-weight: 800; }
        .stat-value { margin: 8px 0 0 0; font-size: 25px; font-weight: 800; color: var(--color-primary-hover); }
        .section { padding: 24px; margin-bottom: 24px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; }
        .section h2 { margin: 0 0 16px; font-size: 20px; color: var(--color-text); }
        .btn-primary, .btn-small, .action-card { background: var(--color-primary); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 800; }
        .btn-primary { padding: 10px 18px; font-size: 14px; }
        .btn-primary:hover, .btn-small:hover, .action-card:hover { background: var(--color-primary-hover); }
        .halls-table-container { overflow-x: auto; }
        .halls-table { width: 100%; border-collapse: collapse; }
        .halls-table thead tr { background: var(--color-primary-soft); border-bottom: 2px solid var(--color-border); }
        .halls-table th, .halls-table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--color-border); }
        .halls-table th { font-weight: 800; color: var(--color-muted); font-size: 12px; }
        .occupancy-bar { display: flex; align-items: center; gap: 10px; width: 120px; }
        .occupancy-fill { height: 7px; background: var(--color-primary); border-radius: 4px; }
        .occupancy-bar span { font-size: 12px; font-weight: 800; color: var(--color-text); }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; color: white; background: var(--color-success); }
        .btn-small { padding: 7px 10px; font-size: 12px; margin-right: 5px; }
        .bookings-list { display: flex; flex-direction: column; gap: 14px; }
        .booking-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: var(--color-surface-warm); border-radius: 8px; border-left: 4px solid var(--color-primary); gap: 16px; }
        .booking-info h4 { margin: 0 0 5px 0; color: var(--color-text); }
        .booking-info p { margin: 0; color: var(--color-muted); font-size: 13px; }
        .booking-earnings { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
        .earnings { font-weight: 800; font-size: 16px; color: var(--color-primary-hover); }
        .booking-earnings .status { font-size: 12px; color: var(--color-success); font-weight: 800; }
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; }
        .action-card { padding: 18px; min-height: 68px; }
        @media (max-width: 768px) { .section-header, .booking-item { align-items: flex-start; flex-direction: column; } }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
