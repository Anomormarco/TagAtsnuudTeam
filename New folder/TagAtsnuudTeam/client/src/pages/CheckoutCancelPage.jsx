import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutCancelPage = () => (
  <div className="checkout-result">
    <div className="result-card">
      <h1>Төлбөр цуцлагдлаа</h1>
      <p>Та захиалгаа дахин нээж төлбөрөө үргэлжлүүлж болно.</p>
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

export default CheckoutCancelPage;
