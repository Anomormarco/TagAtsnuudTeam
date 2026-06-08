const form = document.getElementById('historyForm');
const historyType = document.getElementById('historyType');
const entityId = document.getElementById('entityId');
const table = document.getElementById('historyTable');

// Сонгосон history төрлөөс хамаарч зөв API endpoint буцаана.
function endpoint() {
  if (historyType.value === 'user') {
    return `/api/v1/payments/my?userId=${entityId.value || 1}`;
  }

  if (historyType.value === 'owner') {
    return `/api/v1/payments/owner?ownerId=${entityId.value || 1}`;
  }

  return '/api/v1/payments/admin';
}

// Payment history-г API-аас аваад table-д render хийнэ.
async function loadPaymentHistory() {
  try {
    const response = await fetch(endpoint());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load payment history');
    }

    table.innerHTML = safeRows(
      data,
      (payment) => `
        <tr>
          <td>#${payment.id}</td>
          <td>${payment.bookingId}</td>
          <td>${payment.userId}</td>
          <td>${payment.ownerId}</td>
          <td>${money(payment.amount)}</td>
          <td>${money(payment.platformFee)}</td>
          <td>${money(payment.ownerAmount)}</td>
          <td>${statusBadge(payment.status)}</td>
        </tr>
      `,
      'No payment history yet'
    );
  } catch (error) {
    table.innerHTML = `<tr><td colspan="8" class="error">${error.message}</td></tr>`;
  }
}

// Admin history-д entity id хэрэггүй тул input-ийг disable хийнэ.
historyType.addEventListener('change', () => {
  entityId.disabled = historyType.value === 'admin';
});

// Form submit хийхэд page reload хийхгүйгээр history-г дахин ачаална.
form.addEventListener('submit', (event) => {
  event.preventDefault();
  loadPaymentHistory();
});

// Default view нь admin history.
entityId.disabled = true;
loadPaymentHistory();
