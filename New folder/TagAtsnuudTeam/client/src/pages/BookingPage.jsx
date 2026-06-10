import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import TokenManager from '../utils/tokenManager';

const BANK_INFO = {
  name: 'Tag Zaal LLC',
  bank: 'Хаан Банк',
  account: '5030123456',
};

const BookingPage = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const [paymentStep, setPaymentStep] = useState('review');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [pendingBooking, setPendingBooking] = useState(null);
  const [error, setError] = useState('');
  const [hall, setHall] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventDate: '',
    startTime: '10:00',
    endTime: '12:00',
    eventType: 'sport',
    guestCount: 20,
    notes: '',
  });

  const hallPrice = Number(hall?.pricePerHour || 0);
  const hallName = hall?.name || (hallId ? `Заал #${hallId}` : 'Заал');
  const totalAmount = calculateTotal();

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

  function calculateDuration() {
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    const start = startHour + startMinute / 60;
    const end = endHour + endMinute / 60;
    return Math.max(end - start, 1);
  }

  function calculateTotal() {
    return hallPrice * calculateDuration();
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.eventDate) {
      setError('Огноо сонгоно уу.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('Дуусах цаг эхлэх цагаас хойш байх ёстой.');
      return;
    }

    setPaymentStep('review');
    setPaymentMethod('card');
    setShowSummary(true);
  };

  const ensureBooking = async () => {
    if (pendingBooking) return pendingBooking;

    const user = TokenManager.getUser();

    if (!user?.id) {
      setShowSummary(false);
      setError('Захиалга хийхийн тулд эхлээд нэвтэрнэ үү.');
      navigate('/login');
      return null;
    }

    const bookingResponse = await apiClient.post('/bookings', {
      user_id: user.id,
      hall_id: Number(hallId),
      start_time: `${formData.eventDate} ${formData.startTime}:00`,
      end_time: `${formData.eventDate} ${formData.endTime}:00`,
    });

    const booking = bookingResponse.data.data;
    setPendingBooking(booking);
    return booking;
  };

  const goToPaymentStep = async () => {
    setSubmitting(true);
    setError('');

    try {
      const booking = await ensureBooking();
      if (booking) setPaymentStep('payment');
    } catch (err) {
      setError(err.response?.data?.message || 'Захиалга үүсгэхэд алдаа гарлаа.');
    } finally {
      setSubmitting(false);
    }
  };

  const createPaymentPayload = (booking, method, status = 'paid') => {
    const user = TokenManager.getUser();

    return {
      bookingId: booking.id,
      userId: user.id,
      hallId: Number(hallId),
      ownerId: hall?.ownerId,
      amount: Number(booking.total_price || totalAmount),
      currency: 'MNT',
      method,
      status,
      transactionId: `${method}_${booking.id}_${Date.now()}`,
    };
  };

  const startCardPayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      const booking = await ensureBooking();
      if (!booking) return;

      const user = TokenManager.getUser();
      const checkoutResponse = await apiClient.post('/payments/checkout-session', {
        bookingId: booking.id,
        userId: user.id,
        hallId: Number(hallId),
        ownerId: hall?.ownerId,
        amount: Number(booking.total_price || totalAmount),
        currency: 'MNT',
        name: hallName,
        baseUrl: window.location.origin,
      });

      if (checkoutResponse.data?.checkoutUrl) {
        window.location.href = checkoutResponse.data.checkoutUrl;
        return;
      }

      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Картаар төлөх холбоос үүсгэхэд алдаа гарлаа.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmManualPayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      const booking = await ensureBooking();
      if (!booking) return;

      const method = paymentMethod === 'qr' ? 'qpay' : 'bank_transfer';
      await apiClient.post('/payments', createPaymentPayload(booking, method, 'paid'));
      navigate('/checkout-success?mock=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Төлбөр баталгаажуулахад алдаа гарлаа.');
    } finally {
      setSubmitting(false);
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
                  <option value="training">Сургалт, секц</option>
                  <option value="meeting">Уулзалт</option>
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
            <SummaryCard
              hallName={hallName}
              formData={formData}
              duration={calculateDuration()}
              hallPrice={hallPrice}
              totalAmount={totalAmount}
            />
          </aside>
        </div>

        {showSummary && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="stepper">
                <span className="active">1. Шалгах</span>
                <span className={paymentStep === 'payment' ? 'active' : ''}>2. Төлөх</span>
                <span>3. Баталгаажих</span>
              </div>

              {paymentStep === 'review' ? (
                <>
                  <h2>Захиалга баталгаажуулах</h2>
                  <p>Баталгаажуулахын өмнө мэдээллээ шалгана уу.</p>
                  <div className="modal-details">
                    <p><strong>Заал:</strong> {hallName}</p>
                    <p><strong>Огноо:</strong> {formData.eventDate}</p>
                    <p><strong>Цаг:</strong> {formData.startTime} - {formData.endTime}</p>
                    <p><strong>Хүний тоо:</strong> {formData.guestCount}</p>
                    <p><strong>Нийт төлбөр:</strong> ₮{totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="modal-actions">
                    <button className="btn-secondary" type="button" onClick={() => setShowSummary(false)}>Буцах</button>
                    <button className="btn-primary" type="button" onClick={goToPaymentStep} disabled={submitting}>
                      {submitting ? 'Үүсгэж байна...' : 'Төлбөр төлөх'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2>Төлбөрийн хэлбэр</h2>
                  <div className="payment-methods">
                    <button className={paymentMethod === 'card' ? 'selected' : ''} type="button" onClick={() => setPaymentMethod('card')}>Банкны карт</button>
                    <button className={paymentMethod === 'qr' ? 'selected' : ''} type="button" onClick={() => setPaymentMethod('qr')}>QR төлбөр</button>
                    <button className={paymentMethod === 'bank' ? 'selected' : ''} type="button" onClick={() => setPaymentMethod('bank')}>Данс шилжүүлэг</button>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="payment-panel">
                      <h3>Stripe картаар төлөх</h3>
                      <p>Картын мэдээллээ Stripe-ийн хамгаалалттай хуудсан дээр оруулж төлбөрөө төлнө.</p>
                      <button className="btn-primary" type="button" onClick={startCardPayment} disabled={submitting}>
                        {submitting ? 'Холбож байна...' : 'Картаар төлөх'}
                      </button>
                    </div>
                  ) : (
                    <div className="payment-panel qr-layout">
                      <div className="fake-qr" aria-label="Төлбөрийн QR">
                        {Array.from({ length: 49 }, (_, index) => <i key={index} className={index % 2 === 0 || index % 5 === 0 ? 'dark' : ''} />)}
                      </div>
                      <div className="bank-info">
                        <h3>{paymentMethod === 'qr' ? 'QR кодоор төлөх' : 'Дансаар шилжүүлэх'}</h3>
                        <p><strong>Банк:</strong> {BANK_INFO.bank}</p>
                        <p><strong>Данс:</strong> {BANK_INFO.account}</p>
                        <p><strong>Нэр:</strong> {BANK_INFO.name}</p>
                        <p><strong>Дүн:</strong> ₮{totalAmount.toLocaleString()}</p>
                        <p><strong>Гүйлгээний утга:</strong> BOOKING-{pendingBooking?.id || '...'}</p>
                        <button className="btn-primary" type="button" onClick={confirmManualPayment} disabled={submitting}>
                          {submitting ? 'Баталгаажуулж байна...' : 'Төлбөр хийсэн, баталгаажуулах'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button className="btn-secondary" type="button" onClick={() => setPaymentStep('review')}>Буцах</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .booking-page { padding: 30px 0; background: var(--color-page); min-height: calc(100vh - 200px); }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
        .booking-page h1 { font-size: 28px; color: var(--color-text); margin-bottom: 24px; }
        .error-message { background: #fff1f0; border: 1px solid #ffc6c2; color: var(--color-danger); padding: 12px; border-radius: 6px; margin-bottom: 16px; font-weight: 700; }
        .booking-layout { display: grid; grid-template-columns: 1fr 350px; gap: 24px; }
        .booking-form, .summary-card, .modal { background: white; border-radius: 8px; box-shadow: var(--shadow-card); border: 1px solid var(--color-border); }
        .booking-form { padding: 26px; }
        .form-section h3, .summary-card h3, .modal h2 { margin-bottom: 18px; color: var(--color-text); }
        .form-group { margin-bottom: 18px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 700; color: var(--color-text); font-size: 14px; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 1px solid var(--color-border-strong); border-radius: 6px; font-size: 14px; font-family: inherit; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(232, 111, 27, 0.14); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .btn-primary, .btn-secondary { padding: 13px 16px; border-radius: 6px; font-weight: 800; cursor: pointer; border: none; }
        .btn-primary { width: 100%; background: var(--color-primary); color: white; }
        .btn-primary:hover { background: var(--color-primary-hover); }
        .btn-primary:disabled { background: #c9b8aa; cursor: not-allowed; }
        .btn-secondary { flex: 1; background: white; border: 1px solid var(--color-border-strong); color: var(--color-text); }
        .booking-summary { position: sticky; top: 100px; height: fit-content; }
        .summary-card { padding: 20px; }
        .summary-item, .breakdown-item, .total { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; font-size: 13px; color: var(--color-muted); }
        .summary-item strong, .breakdown-item span:last-child { color: var(--color-text); }
        .divider { height: 1px; background: var(--color-border); margin: 15px 0; }
        .total { align-items: center; padding: 12px; background: var(--color-primary); color: white; border-radius: 6px; font-weight: 800; }
        .total-price { font-size: 18px; color: white; }
        .deposit-info { font-size: 12px; color: var(--color-muted); background: var(--color-surface-warm); padding: 10px; border-radius: 6px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { padding: 28px; max-width: 620px; width: 92%; max-height: 92vh; overflow-y: auto; }
        .stepper { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 20px; }
        .stepper span { background: var(--color-surface-warm); color: var(--color-muted); border-radius: 6px; padding: 9px; text-align: center; font-size: 12px; font-weight: 800; }
        .stepper span.active { background: var(--color-primary); color: white; }
        .modal-details { background: var(--color-surface-warm); padding: 18px; border-radius: 6px; margin: 18px 0; }
        .modal-details p { margin: 9px 0; font-size: 14px; }
        .modal-actions { display: flex; gap: 12px; margin-top: 14px; }
        .modal .btn-primary { flex: 1; width: auto; }
        .payment-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
        .payment-methods button { background: white; border: 1px solid var(--color-border-strong); border-radius: 8px; padding: 12px; font-weight: 800; cursor: pointer; color: var(--color-text); }
        .payment-methods button.selected { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary-hover); }
        .payment-panel { border: 1px solid var(--color-border); border-radius: 8px; padding: 18px; background: #fffaf2; }
        .payment-panel h3 { margin-bottom: 10px; color: var(--color-text); }
        .payment-panel p { color: var(--color-muted); margin-bottom: 10px; line-height: 1.5; }
        .qr-layout { display: grid; grid-template-columns: 160px 1fr; gap: 18px; align-items: start; }
        .fake-qr { width: 160px; height: 160px; display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; background: white; border: 1px solid var(--color-border-strong); border-radius: 8px; padding: 10px; }
        .fake-qr i { background: #f3eadc; border-radius: 2px; }
        .fake-qr i.dark { background: #2b1b10; }
        .bank-info p { margin-bottom: 6px; }
        @media (max-width: 768px) {
          .booking-layout, .form-row, .payment-methods, .qr-layout { grid-template-columns: 1fr; }
          .booking-summary { position: static; }
        }
      `}</style>
    </div>
  );
};

const SummaryCard = ({ hallName, formData, duration, hallPrice, totalAmount }) => (
  <div className="summary-card">
    <h3>Захиалгын хураангуй</h3>
    <div className="summary-item"><span>Заал</span><strong>{hallName}</strong></div>
    <div className="summary-item"><span>Огноо</span><strong>{formData.eventDate || 'Сонгоогүй'}</strong></div>
    <div className="summary-item"><span>Цаг</span><strong>{formData.startTime} - {formData.endTime}</strong></div>
    <div className="summary-item"><span>Үргэлжлэх</span><strong>{duration} цаг</strong></div>
    <div className="summary-item"><span>Хүний тоо</span><strong>{formData.guestCount} хүн</strong></div>
    <div className="divider" />
    <div className="breakdown-item">
      <span>₮{hallPrice.toLocaleString()} × {duration} цаг</span>
      <span>₮{totalAmount.toLocaleString()}</span>
    </div>
    <div className="total">
      <span>Нийт</span>
      <span className="total-price">₮{totalAmount.toLocaleString()}</span>
    </div>
    <div className="deposit-info">
      <strong>30% урьдчилгаа:</strong> ₮{(totalAmount * 0.3).toLocaleString()}
    </div>
  </div>
);

export default BookingPage;
