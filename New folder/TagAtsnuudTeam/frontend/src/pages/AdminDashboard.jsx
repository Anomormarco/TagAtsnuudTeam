import React, { useState } from 'react';

/**
 * Admin Dashboard
 * System-wide analytics and management for administrators
 */
const AdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 1250,
    totalBookings: 456,
    totalRevenue: 22500000,
    platformFee: 2250000,
    totalHalls: 145,
    activeOwners: 89
  });

  const [systemStatus] = useState({
    database: 'Healthy',
    api: 'Online',
    storage: '75%',
    uptime: '99.8%'
  });

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>⚙️ Admin Dashboard</h1>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Total Users</h4>
            <p className="metric-value">{stats.totalUsers}</p>
            <span className="metric-change">↑ 12% from last month</span>
          </div>

          <div className="metric-card">
            <h4>Total Bookings</h4>
            <p className="metric-value">{stats.totalBookings}</p>
            <span className="metric-change">↑ 8% from last month</span>
          </div>

          <div className="metric-card">
            <h4>Total Revenue</h4>
            <p className="metric-value">₮{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
            <span className="metric-change">↑ 15% from last month</span>
          </div>

          <div className="metric-card">
            <h4>Platform Fee</h4>
            <p className="metric-value">₮{(stats.platformFee / 1000000).toFixed(1)}M</p>
            <span className="metric-change">10% commission</span>
          </div>

          <div className="metric-card">
            <h4>Active Halls</h4>
            <p className="metric-value">{stats.totalHalls}</p>
            <span className="metric-change">↑ 5 new this month</span>
          </div>

          <div className="metric-card">
            <h4>Hall Owners</h4>
            <p className="metric-value">{stats.activeOwners}</p>
            <span className="metric-change">↑ 3 new this month</span>
          </div>
        </div>

        {/* System Status */}
        <section className="status-section">
          <h2>System Status</h2>
          <div className="status-grid">
            {Object.entries(systemStatus).map(([key, value]) => (
              <div key={key} className="status-item">
                <span className="status-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span className="status-value">{value}</span>
                <span className={`status-indicator ${value === 'Healthy' || value === 'Online' ? 'ok' : ''}`} />
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activities */}
        <div className="section-row">
          <section className="activity-section">
            <h2>Recent Bookings</h2>
            <div className="activity-list">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="activity-item">
                  <div className="activity-icon">📅</div>
                  <div className="activity-content">
                    <p><strong>Booking #{i.toString().padStart(4, '0')}</strong></p>
                    <p className="activity-meta">Grand Ballroom • ₮600,000 • Confirmed</p>
                  </div>
                  <span className="activity-time">2h ago</span>
                </div>
              ))}
            </div>
          </section>

          <section className="revenue-section">
            <h2>Revenue Breakdown</h2>
            <div className="revenue-chart">
              <div className="chart-item">
                <div className="chart-bar">
                  <div className="bar-segment" style={{ width: '70%', backgroundColor: '#667eea' }} />
                </div>
                <span className="chart-label">Hall Bookings: ₮{(stats.totalRevenue * 0.9).toLocaleString()}</span>
              </div>
              <div className="chart-item">
                <div className="chart-bar">
                  <div className="bar-segment" style={{ width: '10%', backgroundColor: '#28a745' }} />
                </div>
                <span className="chart-label">Platform Fee: ₮{stats.platformFee.toLocaleString()}</span>
              </div>
            </div>
          </section>
        </div>

        {/* User Verification Queue */}
        <section className="verification-section">
          <h2>Pending Verifications</h2>
          <div className="verification-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i}>
                    <td>User #{i}</td>
                    <td>Hall Owner</td>
                    <td>2024-06-{String(10 + i).padStart(2, '0')}</td>
                    <td><span className="badge pending">Pending</span></td>
                    <td>
                      <button className="btn-small approve">Approve</button>
                      <button className="btn-small reject">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Admin Tools */}
        <section className="tools-section">
          <h2>Admin Tools</h2>
          <div className="tools-grid">
            <button className="tool-btn">
              <span>👥</span>
              <span>Manage Users</span>
            </button>
            <button className="tool-btn">
              <span>🏢</span>
              <span>Manage Halls</span>
            </button>
            <button className="tool-btn">
              <span>📋</span>
              <span>Manage Bookings</span>
            </button>
            <button className="tool-btn">
              <span>⚠️</span>
              <span>Review Reports</span>
            </button>
            <button className="tool-btn">
              <span>💰</span>
              <span>Financial Reports</span>
            </button>
            <button className="tool-btn">
              <span>📊</span>
              <span>Analytics</span>
            </button>
            <button className="tool-btn">
              <span>📧</span>
              <span>Send Messages</span>
            </button>
            <button className="tool-btn">
              <span>⚙️</span>
              <span>Settings</span>
            </button>
          </div>
        </section>
      </div>

      <style>{`
        .admin-dashboard {
          padding: 30px 0;
          background: #f8f9fa;
          min-height: calc(100vh - 200px);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .admin-dashboard h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 30px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-top: 4px solid #667eea;
        }

        .metric-card h4 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .metric-value {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 700;
          color: #333;
        }

        .metric-change {
          font-size: 12px;
          color: #28a745;
        }

        .status-section {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .status-section h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .status-item {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-label {
          font-size: 12px;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-value {
          font-size: 18px;
          font-weight: 700;
          color: #333;
        }

        .status-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #dc3545;
          position: absolute;
          top: 10px;
          right: 10px;
        }

        .status-indicator.ok {
          background: #28a745;
        }

        .section-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .activity-section,
        .revenue-section {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .activity-section h2,
        .revenue-section h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
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
          background: #f9f9f9;
          border-radius: 8px;
          align-items: center;
        }

        .activity-icon {
          font-size: 20px;
        }

        .activity-content {
          flex: 1;
        }

        .activity-content p {
          margin: 0;
          color: #333;
        }

        .activity-content p:first-child {
          font-weight: 600;
          margin-bottom: 3px;
        }

        .activity-meta {
          font-size: 12px;
          color: #666;
        }

        .activity-time {
          font-size: 12px;
          color: #999;
        }

        .revenue-chart {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .chart-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chart-bar {
          height: 30px;
          background: #f0f0f0;
          border-radius: 5px;
          overflow: hidden;
        }

        .bar-segment {
          height: 100%;
          border-radius: 5px;
        }

        .chart-label {
          font-size: 13px;
          color: #666;
        }

        .verification-section,
        .tools-section {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
        }

        .verification-section h2,
        .tools-section h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #333;
        }

        .verification-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .verification-table th {
          text-align: left;
          padding: 12px;
          background: #f5f5f5;
          border-bottom: 2px solid #eee;
          font-weight: 600;
          color: #666;
          font-size: 12px;
        }

        .verification-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .badge.pending {
          background: #ffc107;
        }

        .btn-small {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          margin-right: 5px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-small.approve {
          background: #28a745;
          color: white;
        }

        .btn-small.approve:hover {
          background: #218838;
        }

        .btn-small.reject {
          background: #dc3545;
          color: white;
        }

        .btn-small.reject:hover {
          background: #c82333;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
        }

        .tool-btn {
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
          font-size: 13px;
          transition: transform 0.3s;
        }

        .tool-btn:hover {
          transform: translateY(-5px);
        }

        .tool-btn span:first-child {
          font-size: 28px;
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .section-row {
            grid-template-columns: 1fr;
          }

          .tools-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
