import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    const userId = TokenManager.getUser()?.id || 21;
    apiClient.get('/bookings/my', { params: { userId } })
      .then((response) => setBookings(response.data.data || []))
      .catch(() => setBookings([]));
  }, []);

  const getStatusColor = (status) => {
    if (status === 'PAID') return 'var(--color-success)';
    if (status === 'COMPLETED') return 'var(--color-primary)';
    if (status === 'CANCELLED') return 'var(--color-danger)';
    return '#b88700';
  };

  const getStatusLabel = (status) => {
    if (status === 'PAID') return 'Төлөгдсөн';
    if (status === 'COMPLETED') return 'Дууссан';
    if (status === 'CANCELLED') return 'Цуцлагдсан';
    if (status === 'PENDING') return 'Хүлээгдэж байна';
    return 'Хүлээгдэж байна';
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.start_time);
    const today = new Date();
    if (filter === 'upcoming') return bookingDate > today && booking.status !== 'CANCELLED';
    if (filter === 'past') return bookingDate <= today || booking.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="my-bookings-page">
      <div className="container">
        <h1>Миний захиалга</h1>

        <div className="filter-tabs">
          <button className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => setFilter('upcoming')}>Ирэх захиалга</button>
          <button className={`filter-tab ${filter === 'past' ? 'active' : ''}`} onClick={() => setFilter('past')}>Өнгөрсөн</button>
          <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Бүгд</button>
        </div>

        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="empty-state"><p>Захиалга олдсонгүй</p></div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.hall_name}</h3>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                <div className="booking-details">
                  <div className="detail-item"><strong>Огноо:</strong><span>{new Date(booking.start_time).toLocaleDateString()}</span></div>
                  <div className="detail-item"><strong>Цаг:</strong><span>{new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="detail-item"><strong>Байршил:</strong><span>{booking.hall_location}</span></div>
                  <div className="detail-item"><strong>Төлөв:</strong><span>{getStatusLabel(booking.status)}</span></div>
                </div>
                <div className="booking-footer">
                  <div className="price"><span>Нийт:</span><strong>₮{Number(booking.total_price).toLocaleString()}</strong></div>
                  <div className="actions">
                    <button className="btn-secondary">Дэлгэрэнгүй</button>
                    {booking.status !== 'CANCELLED' && <button className="btn-danger">Цуцлах</button>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .my-bookings-page {
          padding: 30px 0;
          background: var(--color-page);
          min-height: calc(100vh - 200px);
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .my-bookings-page h1 {
          font-size: 28px;
          color: var(--color-text);
          margin-bottom: 24px;
        }

        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 10px 16px;
          border: 1px solid var(--color-border-strong);
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 800;
          color: var(--color-muted);
        }

        .filter-tab.active,
        .filter-tab:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .booking-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: var(--shadow-card);
          border: 1px solid var(--color-border);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 12px;
          gap: 12px;
        }

        .booking-header h3 {
          margin: 0;
          color: var(--color-text);
          font-size: 18px;
        }

        .status-badge {
          padding: 6px 12px;
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
        }

        .booking-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 14px;
        }

        .detail-item strong {
          color: var(--color-primary-hover);
        }

        .booking-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid var(--color-border);
          gap: 12px;
        }

        .price {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
        }

        .price strong {
          color: var(--color-primary-hover);
          font-size: 18px;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-secondary,
        .btn-danger {
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .btn-secondary {
          background: var(--color-primary-soft);
          color: var(--color-primary-hover);
        }

        .btn-danger {
          background: var(--color-danger);
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-muted);
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .booking-footer,
          .booking-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default MyBookingsPage;
