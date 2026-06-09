import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * Booking Page
 * Interface for users to book a hall with date, time, and payment
 */
const BookingPage = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    eventDate: '',
    startTime: '10:00',
    endTime: '12:00',
    eventType: 'wedding',
    guestCount: 50,
    notes: ''
  });

  const [showSummary, setShowSummary] = useState(false);

  const hallPrice = 150000;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateDuration = () => {
    const start = parseInt(formData.startTime.split(':')[0]);
    const end = parseInt(formData.endTime.split(':')[0]);
    return end - start || 1;
  };

  const calculateTotal = () => {
    return hallPrice * calculateDuration();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSummary(true);
  };

  const handleConfirmBooking = async () => {
    // Call booking API here
    alert('Booking confirmed! Redirecting to payment...');
    navigate('/bookings');
  };

  return (
    <div className="booking-page">
      <div className="container">
        <h1>Book Your Hall</h1>

        <div className="booking-layout">
          {/* Booking Form */}
          <form className="booking-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <h3>Event Details</h3>

              <div className="form-group">
                <label>Event Type *</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="conference">Conference</option>
                  <option value="meeting">Business Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Event Date *</label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Expected Guests *</label>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleInputChange}
                  min="1"
                  max="500"
                  required
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or notes..."
                  rows="4"
                />
              </div>
            </section>

            <button type="submit" className="btn-primary">
              Review Booking
            </button>
          </form>

          {/* Booking Summary */}
          <aside className="booking-summary">
            <div className="summary-card">
              <h3>Booking Summary</h3>
              
              <div className="summary-item">
                <span>Hall</span>
                <strong>Grand Ballroom</strong>
              </div>

              <div className="summary-item">
                <span>Date</span>
                <strong>{formData.eventDate || 'Not selected'}</strong>
              </div>

              <div className="summary-item">
                <span>Duration</span>
                <strong>{calculateDuration()} hour{calculateDuration() !== 1 ? 's' : ''}</strong>
              </div>

              <div className="summary-item">
                <span>Time</span>
                <strong>{formData.startTime} - {formData.endTime}</strong>
              </div>

              <div className="summary-item">
                <span>Guests</span>
                <strong>{formData.guestCount} people</strong>
              </div>

              <div className="summary-item">
                <span>Type</span>
                <strong>{formData.eventType.charAt(0).toUpperCase() + formData.eventType.slice(1)}</strong>
              </div>

              <div className="divider"></div>

              <div className="price-breakdown">
                <div className="breakdown-item">
                  <span>₮{hallPrice.toLocaleString()} × {calculateDuration()} hour</span>
                  <span>₮{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="total">
                <span>Total</span>
                <span className="total-price">₮{calculateTotal().toLocaleString()}</span>
              </div>

              <div className="deposit-info">
                <strong>30% Deposit:</strong> ₮{(calculateTotal() * 0.3).toLocaleString()}
              </div>
            </div>
          </aside>
        </div>

        {/* Confirmation Modal */}
        {showSummary && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Confirm Your Booking</h2>
              <p>Please review your booking details before confirming.</p>
              
              <div className="modal-details">
                <p><strong>Hall:</strong> Grand Ballroom</p>
                <p><strong>Date:</strong> {formData.eventDate}</p>
                <p><strong>Time:</strong> {formData.startTime} - {formData.endTime}</p>
                <p><strong>Guests:</strong> {formData.guestCount}</p>
                <p><strong>Total Cost:</strong> ₮{calculateTotal().toLocaleString()}</p>
                <p><strong>Deposit Required:</strong> ₮{(calculateTotal() * 0.3).toLocaleString()}</p>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowSummary(false)}>
                  Back
                </button>
                <button className="btn-primary" onClick={handleConfirmBooking}>
                  Confirm & Pay
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .booking-page {
          padding: 30px 0;
          background: #f8f9fa;
          min-height: calc(100vh - 200px);
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .booking-page h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 30px;
        }

        .booking-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 30px;
        }

        .booking-form {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .form-section {
          margin-bottom: 30px;
        }

        .form-section h3 {
          margin-bottom: 20px;
          color: #333;
          font-size: 18px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .booking-summary {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .summary-card h3 {
          margin-bottom: 20px;
          color: #333;
          font-size: 16px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 13px;
          color: #666;
        }

        .summary-item span:first-child {
          font-weight: 500;
        }

        .summary-item strong {
          color: #333;
        }

        .divider {
          height: 1px;
          background: #eee;
          margin: 15px 0;
        }

        .price-breakdown {
          margin-bottom: 15px;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #666;
        }

        .total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 5px;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .total-price {
          font-size: 18px;
        }

        .deposit-info {
          font-size: 12px;
          color: #666;
          background: #f9f9f9;
          padding: 10px;
          border-radius: 5px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 30px;
          border-radius: 10px;
          max-width: 500px;
          width: 90%;
        }

        .modal h2 {
          margin-bottom: 15px;
          color: #333;
        }

        .modal p {
          color: #666;
          margin-bottom: 20px;
        }

        .modal-details {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .modal-details p {
          margin: 10px 0;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
        }

        .btn-secondary {
          flex: 1;
          padding: 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .modal .btn-primary {
          flex: 1;
          width: auto;
        }

        @media (max-width: 768px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }

          .booking-summary {
            position: static;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
