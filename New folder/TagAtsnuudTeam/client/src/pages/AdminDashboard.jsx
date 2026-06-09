import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  const [systemStatus] = useState({
    database: 'Хэвийн',
    api: 'Ажиллаж байна',
    storage: '75%',
    uptime: '99.8%',
  });

  useEffect(() => {
    apiClient.get('/dashboard/admin')
      .then((response) => setStats(response.data))
      .catch(() => setStats({
        totalUsers: 0,
        totalBookings: 0,
        totalHalls: 0,
        paidRevenue: 0,
        platformRevenue: 0,
        ownerRevenue: 0,
        recentPayments: [],
      }));
  }, []);

  if (!stats) {
    return <div className="admin-dashboard"><div className="container">Ачаалж байна...</div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Админ самбар</h1>

        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Нийт хэрэглэгч</h4>
            <p className="metric-value">{stats.totalUsers}</p>
            <span className="metric-change">Өнгөрсөн сараас 12% өссөн</span>
          </div>
          <div className="metric-card">
            <h4>Нийт захиалга</h4>
            <p className="metric-value">{stats.totalBookings}</p>
            <span className="metric-change">Өнгөрсөн сараас 8% өссөн</span>
          </div>
          <div className="metric-card">
            <h4>Нийт орлого</h4>
            <p className="metric-value">₮{(Number(stats.paidRevenue) / 1000000).toFixed(1)} сая</p>
            <span className="metric-change">Өнгөрсөн сараас 15% өссөн</span>
          </div>
          <div className="metric-card">
            <h4>Платформ шимтгэл</h4>
            <p className="metric-value">₮{(Number(stats.platformRevenue) / 1000000).toFixed(1)} сая</p>
            <span className="metric-change">10% шимтгэл</span>
          </div>
          <div className="metric-card">
            <h4>Идэвхтэй заал</h4>
            <p className="metric-value">{stats.totalHalls}</p>
            <span className="metric-change">Энэ сард 5 заал нэмэгдсэн</span>
          </div>
          <div className="metric-card">
            <h4>Заал эзэмшигч</h4>
            <p className="metric-value">{stats.recentPayouts?.length || 0}</p>
            <span className="metric-change">Энэ сард 3 эзэмшигч нэмэгдсэн</span>
          </div>
        </div>

        <section className="panel">
          <h2>Системийн төлөв</h2>
          <div className="status-grid">
            {Object.entries(systemStatus).map(([key, value]) => (
              <div key={key} className="status-item">
                <span className="status-label">{key}</span>
                <span className="status-value">{value}</span>
                <span className="status-indicator ok" />
              </div>
            ))}
          </div>
        </section>

        <div className="section-row">
          <section className="panel">
            <h2>Сүүлийн захиалгууд</h2>
            <div className="activity-list">
              {(stats.recentPayments || []).map((payment) => (
                <div key={payment.id} className="activity-item">
                  <div className="activity-content">
                    <p><strong>Захиалга #{String(payment.bookingId).padStart(4, '0')}</strong></p>
                    <p className="activity-meta">{payment.hallName || 'Заал'} · ₮{Number(payment.amount).toLocaleString()} · {payment.status}</p>
                  </div>
                  <span className="activity-time">{new Date(payment.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h2>Орлогын задаргаа</h2>
            <div className="revenue-chart">
              <div className="chart-item">
                <div className="chart-bar">
                  <div className="bar-segment" style={{ width: '70%', backgroundColor: 'var(--color-primary)' }} />
                </div>
                <span className="chart-label">Заалын захиалга: ₮{Number(stats.paidRevenue).toLocaleString()}</span>
              </div>
              <div className="chart-item">
                <div className="chart-bar">
                  <div className="bar-segment" style={{ width: '10%', backgroundColor: 'var(--color-success)' }} />
                </div>
                <span className="chart-label">Платформ шимтгэл: ₮{Number(stats.platformRevenue).toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>

        <section className="panel">
          <h2>Сүүлийн шилжүүлгүүд</h2>
          <div className="verification-table">
            <table>
              <thead>
                <tr>
                  <th>Эзэмшигч</th>
                  <th>Төлбөр</th>
                  <th>Дүн</th>
                  <th>Төлөв</th>
                  <th>Огноо</th>
                </tr>
              </thead>
              <tbody>
                {(stats.recentPayouts || []).map((payout) => (
                  <tr key={payout.id}>
                    <td>Эзэмшигч #{payout.ownerId}</td>
                    <td>Төлбөр #{payout.paymentId}</td>
                    <td>₮{Number(payout.amount).toLocaleString()}</td>
                    <td><span className="badge pending">{payout.status}</span></td>
                    <td>{new Date(payout.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h2>Удирдлагын хэрэгслүүд</h2>
          <div className="tools-grid">
            {['Хэрэглэгч', 'Заал', 'Захиалга', 'Тайлан', 'Санхүү', 'Тохиргоо'].map((item) => (
              <button key={item} className="tool-btn">{item}</button>
            ))}
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

        .admin-dashboard h1 {
          font-size: 28px;
          color: var(--color-text);
          margin-bottom: 24px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .metric-card,
        .panel {
          background: white;
          border-radius: 8px;
          box-shadow: var(--shadow-card);
          border: 1px solid var(--color-border);
        }

        .metric-card {
          padding: 18px;
          border-top: 4px solid var(--color-primary);
        }

        .metric-card h4 {
          margin: 0 0 10px 0;
          color: var(--color-muted);
          font-size: 12px;
          font-weight: 800;
        }

        .metric-value {
          margin: 0 0 8px 0;
          font-size: 27px;
          font-weight: 800;
          color: var(--color-text);
        }

        .metric-change {
          font-size: 12px;
          color: var(--color-success);
        }

        .panel {
          padding: 24px;
          margin-bottom: 24px;
        }

        .panel h2 {
          margin: 0 0 18px 0;
          font-size: 20px;
          color: var(--color-text);
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
        }

        .status-item {
          background: var(--color-surface-warm);
          padding: 14px;
          border-radius: 8px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-label {
          font-size: 12px;
          color: var(--color-muted);
          font-weight: 800;
        }

        .status-value {
          font-size: 17px;
          font-weight: 800;
          color: var(--color-text);
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--color-success);
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .section-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--color-surface-warm);
          border-radius: 8px;
          align-items: center;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          margin: 0;
        }

        .activity-meta,
        .activity-time,
        .chart-label {
          font-size: 12px;
          color: var(--color-muted);
        }

        .revenue-chart {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .chart-bar {
          height: 30px;
          background: var(--color-primary-soft);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .bar-segment {
          height: 100%;
        }

        .verification-table {
          overflow-x: auto;
        }

        .verification-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .verification-table th {
          text-align: left;
          padding: 12px;
          background: var(--color-primary-soft);
          border-bottom: 2px solid var(--color-border);
          font-weight: 800;
          color: var(--color-muted);
          font-size: 12px;
        }

        .verification-table td {
          padding: 12px;
          border-bottom: 1px solid var(--color-border);
        }

        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          color: #8a5a00;
          background: #fff2bd;
        }

        .btn-small {
          padding: 7px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          margin-right: 5px;
          font-weight: 800;
        }

        .btn-small.approve {
          background: var(--color-success);
          color: white;
        }

        .btn-small.reject {
          background: var(--color-danger);
          color: white;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 14px;
        }

        .tool-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 800;
        }

        .tool-btn:hover {
          background: var(--color-primary-hover);
        }

        @media (max-width: 768px) {
          .section-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
