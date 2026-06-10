import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Төлбөр баталгаажиж байна...');

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      setMessage('Төлбөр амжилттай боллоо.');
      return;
    }

    apiClient.patch(`/payments/${paymentId}/status`, {
      status: 'paid',
      transactionId: searchParams.get('session_id') || `mock_${paymentId}`,
    })
      .then(() => setMessage('Төлбөр амжилттай баталгаажлаа.'))
      .catch(() => setMessage('Төлбөр хийгдсэн ч төлөв шинэчлэхэд алдаа гарлаа.'));
  }, [searchParams]);

  return (
    <div className="checkout-result">
      <div className="result-card">
        <h1>{message}</h1>
        <p>Захиалгын жагсаалтаас төлөвөө шалгана уу.</p>
        <Link to="/bookings">Миний захиалга</Link>
      </div>

      <style>{`
        .checkout-result {
          min-height: calc(100vh - 220px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background: var(--color-page);
        }

        .result-card {
          max-width: 520px;
          width: 100%;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: var(--shadow-card);
          text-align: center;
          padding: 34px;
        }

        .result-card h1 {
          color: var(--color-text);
          font-size: 24px;
          margin-bottom: 12px;
        }

        .result-card p {
          color: var(--color-muted);
          margin-bottom: 22px;
        }

        .result-card a {
          display: inline-block;
          background: var(--color-primary);
          color: white;
          border-radius: 6px;
          padding: 11px 16px;
          text-decoration: none;
          font-weight: 800;
        }
      `}</style>
    </div>
  );
};

export default CheckoutSuccessPage;
