import React, { useState, useEffect } from 'react';

/**
 * Owner Dashboard
 * Hall management, bookings, and earnings for hall owners
 */
const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    totalHalls: 3,
    totalBookings: 24,
    totalEarnings: 3600000,
    monthlyEarnings: 1200000
  });

  const [halls, setHalls] = useState([
    {
      id: 1,
      name: 'Grand Ballroom',
      bookings: 12,
      earnings: 1800000,
      occupancy: 85,
      status: 'active'
    },
    {
      id: 2,
      name: 'Business Hub',
      bookings: 8,
      earnings: 1200000,
      occupancy: 60,
      status: 'active'
    },
    {
      id: 3,
      name: 'Cozy Lounge',
      bookings: 4,
      earnings: 600000,
      occupancy: 40,
      status: 'active'
    }
  ]);

  return (
    <div className="owner-dashboard">
      <div className="container">
        <h1>🏢 Owner Dashboard</h1>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>Total Halls</h4>
              <p className="stat-value">{stats.totalHalls}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h4>Total Bookings</h4>
              <p className="stat-value">{stats.totalBookings}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h4>Total Earnings</h4>
              <p className="stat-value">₮{(stats.totalEarnings / 1000000).toFixed(1)}M</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h4>This Month</h4>
              <p className="stat-value">₮{(stats.monthlyEarnings / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>

        {/* Halls Management */}
        <section className="section">
          <div className="section-header">
            <h2>My Halls</h2>
            <button className="btn-primary">+ Add New Hall</button>
          </div>

          <div className="halls-table-container">
            <table className="halls-table">
              <thead>
                <tr>
                  <th>Hall Name</th>
                  <th>Bookings</th>
                  <th>Earnings</th>
                  <th>Occupancy</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {halls.map(hall => (
                  <tr key={hall.id}>
                    <td><strong>{hall.name}</strong></td>
                    <td>{hall.bookings}</td>
                    <td>₮{hall.earnings.toLocaleString()}</td>
                    <td>
                      <div className="occupancy-bar">
                        <div 
                          className="occupancy-fill"
                          style={{ width: `${hall.occupancy}%` }}
                        />
                        <span>{hall.occupancy}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge active">{hall.status}</span>
                    </td>
                    <td>
                      <button className="btn-small">Edit</button>
                      <button className="btn-small">View Bookings</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Bookings */}
        <section className="section">
          <h2>Recent Bookings</h2>
          <div className="bookings-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="booking-item">
                <div className="booking-info">
                  <h4>Wedding Reception</h4>
                  <p>Grand Ballroom • June 15, 2024 • 6:00 PM - 10:00 PM</p>
                </div>
                <div className="booking-earnings">
                  <span className="earnings">₮600,000</span>
                  <span className="status">Confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-card">
              <span className="icon">📸</span>
              <span>Upload Photos</span>
            </button>
            <button className="action-card">
              <span className="icon">⚙️</span>
              <span>Settings</span>
            </button>
            <button className="action-card">
              <span className="icon">💳</span>
              <span>Manage Payments</span>
            </button>
            <button className="action-card">
              <span className="icon">📊</span>
              <span>View Reports</span>
            </button>
          </div>
        </section>
      </div>

      <style>{`
        .owner-dashboard {
          padding: 30px 0;
          background: #f8f9fa;
          min-height: calc(100vh - 200px);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .owner-dashboard h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-content h4 {
          margin: 0;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .stat-value {
          margin: 5px 0 0 0;
          font-size: 24px;
          font-weight: 700;
          color: #667eea;
        }

        .section {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .btn-primary {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.3s;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .halls-table-container {
          overflow-x: auto;
        }

        .halls-table {
          width: 100%;
          border-collapse: collapse;
        }

        .halls-table thead tr {
          background: #f5f5f5;
          border-bottom: 2px solid #eee;
        }

        .halls-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #666;
          font-size: 12px;
        }

        .halls-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #eee;
        }

        .occupancy-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100px;
        }

        .occupancy-fill {
          height: 6px;
          background: #667eea;
          border-radius: 3px;
        }

        .occupancy-bar span {
          font-size: 12px;
          font-weight: 600;
          color: #333;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .status-badge.active {
          background: #28a745;
        }

        .btn-small {
          background: #667eea;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-right: 5px;
          transition: background 0.3s;
        }

        .btn-small:hover {
          background: #5568d3;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .booking-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .booking-info h4 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .booking-info p {
          margin: 0;
          color: #666;
          font-size: 13px;
        }

        .booking-earnings {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
        }

        .earnings {
          font-weight: 700;
          font-size: 16px;
          color: #667eea;
        }

        .booking-earnings .status {
          font-size: 12px;
          color: #28a745;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .action-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 20px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          transition: transform 0.3s;
        }

        .action-card:hover {
          transform: translateY(-5px);
        }

        .icon {
          font-size: 32px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .halls-table {
            font-size: 13px;
          }

          .halls-table th,
          .halls-table td {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
