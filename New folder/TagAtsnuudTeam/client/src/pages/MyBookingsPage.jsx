import React, { useState, useEffect } from 'react';

/**
 * My Bookings Page
 * Shows user's bookings history and upcoming bookings
 */
const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    // Fetch bookings - Replace with API call
    const mockBookings = [
      {
        id: 1,
        hallName: 'Grand Ballroom',
        date: '2024-06-15',
        startTime: '18:00',
        endTime: '22:00',
        guestCount: 150,
        status: 'confirmed',
        totalPrice: 600000,
        eventType: 'Wedding'
      },
      {
        id: 2,
        hallName: 'Business Hub',
        date: '2024-05-20',
        startTime: '09:00',
        endTime: '12:00',
        guestCount: 50,
        status: 'completed',
        totalPrice: 210000,
        eventType: 'Conference'
      },
      {
        id: 3,
        hallName: 'Cozy Lounge',
        date: '2024-04-10',
        startTime: '19:00',
        endTime: '23:00',
        guestCount: 30,
        status: 'cancelled',
        totalPrice: 200000,
        eventType: 'Birthday Party'
      }
    ];
    setBookings(mockBookings);
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return '#28a745';
      case 'completed': return '#667eea';
      case 'cancelled': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return bookingDate > today && booking.status === 'confirmed';
    } else if (filter === 'past') {
      return bookingDate <= today || booking.status === 'completed';
    }
    return true;
  });

  return (
    <div className="my-bookings-page">
      <div className="container">
        <h1>My Bookings</h1>

        {/* Filters */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            📅 Upcoming
          </button>
          <button
            className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            ✅ Past
          </button>
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            📋 All
          </button>
        </div>

        {/* Bookings List */}
        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <p>No bookings found</p>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.hallName}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <strong>📅 Date:</strong>
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <strong>⏰ Time:</strong>
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="detail-item">
                    <strong>👥 Guests:</strong>
                    <span>{booking.guestCount} people</span>
                  </div>
                  <div className="detail-item">
                    <strong>🎊 Event:</strong>
                    <span>{booking.eventType}</span>
                  </div>
                </div>

                <div className="booking-footer">
                  <div className="price">
                    <span>Total:</span>
                    <strong>₮{booking.totalPrice.toLocaleString()}</strong>
                  </div>
                  <div className="actions">
                    <button className="btn-secondary">View Details</button>
                    {booking.status === 'confirmed' && (
                      <>
                        <button className="btn-primary">Modify</button>
                        <button className="btn-danger">Cancel</button>
                      </>
                    )}
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
          background: #f8f9fa;
          min-height: calc(100vh - 200px);
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .my-bookings-page h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 30px;
        }

        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .filter-tab {
          padding: 10px 20px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          transition: all 0.3s;
        }

        .filter-tab:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .filter-tab.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .booking-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: box-shadow 0.3s;
        }

        .booking-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #f5f5f5;
          padding-bottom: 12px;
        }

        .booking-header h3 {
          margin: 0;
          color: #333;
          font-size: 18px;
        }

        .status-badge {
          padding: 6px 14px;
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .booking-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .detail-item strong {
          color: #667eea;
          margin-right: 8px;
        }

        .detail-item span {
          color: #333;
        }

        .booking-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid #f5f5f5;
        }

        .price {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }

        .price strong {
          color: #667eea;
          font-size: 18px;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .btn-secondary,
        .btn-primary,
        .btn-danger {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover {
          background: #ececec;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .booking-details {
            grid-template-columns: 1fr 1fr;
          }

          .booking-footer {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .actions {
            width: 100%;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default MyBookingsPage;
