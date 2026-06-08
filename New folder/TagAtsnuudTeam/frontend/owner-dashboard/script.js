// Owner dashboard нь ownerId-аар тухайн эзэмшигчийн орлого, payout, payment history-г авна.
async function loadOwnerDashboard(ownerId) {
  try {
    const response = await fetch(`/api/v1/dashboard/owner/${ownerId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load owner dashboard');
    }

    // Owner summary metric-үүд.
    document.getElementById('paidRevenue').textContent = money(data.paidRevenue);
    document.getElementById('pendingRevenue').textContent = money(data.pendingRevenue);
    document.getElementById('paidCommission').textContent = money(data.paidCommission);
    document.getElementById('totalPayments').textContent = data.totalPayments || 0;
    document.getElementById('pendingPayoutAmount').textContent = money(data.pendingPayoutAmount);
    document.getElementById('paidPayoutAmount').textContent = money(data.paidPayoutAmount);
    document.getElementById('totalPayouts').textContent = data.totalPayouts || 0;

    // Owner-ийн payment history table.
    document.getElementById('paymentsTable').innerHTML = safeRows(
      data.payments,
      (payment) => `
        <tr>
          <td>#${payment.id}</td>
          <td>${payment.bookingId}</td>
          <td>${payment.hallId}</td>
          <td>${money(payment.amount)}</td>
          <td>${money(payment.platformFee)}</td>
          <td>${money(payment.ownerAmount)}</td>
          <td>${statusBadge(payment.status)}</td>
        </tr>
      `,
      'No owner payments yet'
    );

    // Owner-ийн payout history table.
    document.getElementById('payoutsTable').innerHTML = safeRows(
      data.payouts,
      (payout) => `
        <tr>
          <td>#${payout.id}</td>
          <td>${payout.paymentId ? `#${payout.paymentId}` : '-'}</td>
          <td>${money(payout.amount)}</td>
          <td>${payout.payoutMethod}</td>
          <td>${statusBadge(payout.status)}</td>
        </tr>
      `,
      'No owner payouts yet'
    );
  } catch (error) {
    document.querySelector('.main').insertAdjacentHTML('beforeend', `<p class="error">${error.message}</p>`);
  }
}

document.getElementById('ownerForm').addEventListener('submit', (event) => {
  event.preventDefault();
  loadOwnerDashboard(document.getElementById('ownerId').value || 1);
});

// Анх нээгдэхэд ownerId=1 гэж үзээд dashboard ачаална.
loadOwnerDashboard(1);
