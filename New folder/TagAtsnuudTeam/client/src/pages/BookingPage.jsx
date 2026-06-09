import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

const BookingPage = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState('');
  const [hall, setHall] = useState(null);
  const [formData, setFormData] = useState({
    eventDate: '',
    startTime: '10:00',
    endTime: '12:00',
    eventType: 'sport',
    guestCount: 20,
    notes: '',
  });

  const hallPrice = Number(hall?.pricePerHour || 150000);
  const hallName = hall?.name || (hallId ? `Заал #${hallId}` : 'Заал');

  useEffect(() => {
    if (!hallId) return;
    apiClient.get(`/halls/${hallId}`)
      .then((response) => setHall(response.data.data))
      .catch(() => setHall(null));
  }, [hallId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateDuration = () => {
    const start = parseInt(formData.startTime.split(':')[0], 10);
    const end = parseInt(formData.endTime.split(':')[0], 10);
    return Math.max(end - start, 1);
  };

  const calculateTotal = () => hallPrice * calculateDuration();

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSummary(true);
  };

  const handleConfirmBooking = async () => {
    try {
      const userId = TokenManager.getUser()?.id || 21;
      await apiClient.post('/bookings', {
        user_id: userId,
        hall_id: Number(hallId || 1),
        start_time: `${formData.eventDate} ${formData.startTime}:00`,
        end_time: `${formData.eventDate} ${formData.endTime}:00`,
      });
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Захиалга үүсгэхэд алдаа гарлаа');
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        <h1>Заал захиалах</h1>
        {error && <div className="error-message">{error}</div>}

        <div className="booking-layout">
          <form className="booking-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <h3>Захиалгын мэдээлэл</h3>

              <div className="form-group">
                <label>Зориулалт *</label>
                <select name="eventType" value={formData.eventType} onChange={handleInputChange} required>
                  <option value="sport">Спорт тоглолт</option>
                  <option value="training">Сургалт секц</option>
                  <option value="meeting">Хурал уулзалт</option>
                  <option value="event">Арга хэмжээ</option>
                  <option value="other">Бусад</option>
                </select>
              </div>

              <div className="form-group">
                <label>Огноо *</label>
                <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Эхлэх цаг *</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Дуусах цаг *</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Хүний тоо *</label>
                <input type="number" name="guestCount" value={formData.guestCount} onChange={handleInputChange} min="1" max="500" required />
              </div>

              <div className="form-group">
                <label>Нэмэлт тайлбар</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Тусгай хүсэлт байвал бичнэ үү..." rows="4" />
              </div>
            </section>

            <button type="submit" className="btn-primary">Захиалгаа шалгах</button>
          </form>

          <aside className="booking-summary">
            <div className="summary-card">
              <h3>Захиалгын хураангуй</h3>
              <div className="summary-item"><span>Заал</span><strong>{hallName}</strong></div>
              <div className="summary-item"><span>Огноо</span><strong>{formData.eventDate || 'Сонгоогүй'}</strong></div>
              <div className="summary-item"><span>Цаг</span><strong>{formData.startTime} - {formData.endTime}</strong></div>
              <div className="summary-item"><span>Үргэлжлэх</span><strong>{calculateDuration()} цаг</strong></div>
              <div className="summary-item"><span>Хүний тоо</span><strong>{formData.guestCount} хүн</strong></div>
              <div className="divider" />
              <div className="breakdown-item">
                <span>₮{hallPrice.toLocaleString()} × {calculateDuration()} цаг</span>
                <span>₮{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="total">
                <span>Нийт</span>
                <span className="total-price">₮{calculateTotal().toLocaleString()}</span>
              </div>
              <div className="deposit-info">
                <strong>30% урьдчилгаа:</strong> ₮{(calculateTotal() * 0.3).toLocaleString()}
              </div>
            </div>
          </aside>
        </div>

        {showSummary && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Захиалга баталгаажуулах</h2>
              <p>Баталгаажуулахын өмнө мэдээллээ шалгана уу.</p>
              <div className="modal-details">
                <p><strong>Заал:</strong> {hallName}</p>
                <p><strong>Огноо:</strong> {formData.eventDate}</p>
                <p><strong>Цаг:</strong> {formData.startTime} - {formData.endTime}</p>
                <p><strong>Хүний тоо:</strong> {formData.guestCount}</p>
                <p><strong>Нийт төлбөр:</strong> ₮{calculateTotal().toLocaleString()}</p>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowSummary(false)}>Буцах</button>
                <button className="btn-primary" onClick={handleConfirmBooking}>Баталгаажуулах</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .booking-page {
          padding: 30px 0;
          background: var(--color-page);
          min-height: calc(100vh - 200px);
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .booking-page h1 {
          font-size: 28px;
          color: var(--color-text);
          margin-bottom: 24px;
        }

        .error-message {
          background: #fff1f0;
          border: 1px solid #ffc6c2;
          color: var(--color-danger);
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-weight: 700;
        }

        .booking-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 24px;
        }

        .booking-form,
        .summary-card,
        .modal {
          background: white;
          border-radius: 8px;
          box-shadow: var(--shadow-card);
          border: 1px solid var(--color-border);
        }

        .booking-form {
          padding: 26px;
        }

        .form-section h3,
        .summary-card h3,
        .modal h2 {
          margin-bottom: 18px;
          color: var(--color-text);
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 700;
          color: var(--color-text);
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--color-border-strong);
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(232, 111, 27, 0.14);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 13px 16px;
          border-radius: 6px;
          font-weight: 800;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          width: 100%;
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--color-primary-hover);
        }

        .btn-secondary {
          flex: 1;
          background: white;
          border: 1px solid var(--color-border-strong);
          color: var(--color-text);
        }

        .booking-summary {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .summary-card {
          padding: 20px;
        }

        .summary-item,
        .breakdown-item,
        .total {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 13px;
          color: var(--color-muted);
        }

        .summary-item strong,
        .breakdown-item span:last-child {
          color: var(--color-text);
        }

        .divider {
          height: 1px;
          background: var(--color-border);
          margin: 15px 0;
        }

        .total {
          align-items: center;
          padding: 12px;
          background: var(--color-primary);
          color: white;
          border-radius: 6px;
          font-weight: 800;
        }

        .total-price {
          font-size: 18px;
        }

        .deposit-info {
          font-size: 12px;
          color: var(--color-muted);
          background: var(--color-surface-warm);
          padding: 10px;
          border-radius: 6px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          padding: 28px;
          max-width: 500px;
          width: 90%;
        }

        .modal-details {
          background: var(--color-surface-warm);
          padding: 18px;
          border-radius: 6px;
          margin: 18px 0;
        }

        .modal-details p {
          margin: 9px 0;
          font-size: 14px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }

        .modal .btn-primary {
          flex: 1;
          width: auto;
        }

        @media (max-width: 768px) {
          .booking-layout,
          .form-row {
            grid-template-columns: 1fr;
          }

          .booking-summary {
            position: static;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
