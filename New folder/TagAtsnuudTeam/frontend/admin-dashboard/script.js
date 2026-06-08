// Admin dashboard API-аас summary, recent payments, payouts, status breakdown уншина.
async function loadAdminDashboard() {
  try {
    const response = await fetch('/api/v1/dashboard/admin');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load dashboard');
    }

    // Дээд metric card-уудын тоон утгуудыг шинэчилнэ.
    document.getElementById('totalPayments').textContent = data.totalPayments || 0;
    document.getElementById('paidRevenue').textContent = money(data.paidRevenue);
    document.getElementById('platformRevenue').textContent = money(data.platformRevenue);
    document.getElementById('ownerRevenue').textContent = money(data.ownerRevenue);
    document.getElementById('pendingAmount').textContent = money(data.pendingAmount);
    document.getElementById('failedAmount').textContent = money(data.failedAmount);

    // Сүүлийн payment-үүдийн table.
    document.getElementById('paymentsTable').innerHTML = safeRows(
      data.recentPayments,
      (payment) => `
        <tr>
          <td>#${payment.id}</td>
          <td>${payment.bookingId}</td>
          <td>${payment.ownerId}</td>
          <td>${money(payment.amount)}</td>
          <td>${money(payment.platformFee)}</td>
          <td>${money(payment.ownerAmount)}</td>
          <td>${statusBadge(payment.status)}</td>
        </tr>
      `,
      'No payments yet'
    );

    // Сүүлийн owner payout-уудын table.
    document.getElementById('payoutsTable').innerHTML = safeRows(
      data.recentPayouts,
      (payout) => `
        <tr>
          <td>#${payout.id}</td>
          <td>${payout.paymentId ? `#${payout.paymentId}` : '-'}</td>
          <td>${payout.ownerId}</td>
          <td>${money(payout.amount)}</td>
          <td>${payout.payoutMethod}</td>
          <td>${statusBadge(payout.status)}</td>
        </tr>
      `,
      'No payouts yet'
    );

    // Payment status бүрийн count/amount breakdown.
    document.getElementById('statusesTable').innerHTML = safeRows(
      data.paymentStatuses,
      (status) => `
        <tr>
          <td>${statusBadge(status.status)}</td>
          <td>${status.count}</td>
          <td>${money(status.amount)}</td>
        </tr>
      `,
      'No statuses yet'
    );
  } catch (error) {
    document.querySelector('.main').insertAdjacentHTML('beforeend', `<p class="error">${error.message}</p>`);
  }
}

loadAdminDashboard();
