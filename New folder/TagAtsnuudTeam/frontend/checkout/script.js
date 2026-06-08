const form = document.getElementById('checkoutForm');
const statusText = document.getElementById('checkoutStatus');
const button = document.getElementById('checkoutButton');

// FormData-г backend checkout-session API-д хэрэгтэй payload хэлбэрт оруулна.
function formPayload(formData) {
  return {
    bookingId: Number(formData.get('bookingId')),
    userId: Number(formData.get('userId')),
    hallId: Number(formData.get('hallId')),
    ownerId: Number(formData.get('ownerId')),
    amount: Number(formData.get('amount')),
    currency: String(formData.get('currency') || 'MNT').trim(),
    name: String(formData.get('name') || 'Hall booking').trim(),
    baseUrl: window.location.origin
  };
}

// Checkout submit үед backend Stripe session үүсгээд хэрэглэгчийг Stripe URL руу явуулна.
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  button.disabled = true;
  statusText.className = 'checkout-status';
  statusText.textContent = 'Creating Stripe checkout session...';

  try {
    // Backend payment skeleton хадгалаад Stripe checkout URL буцаана.
    const response = await fetch('/api/v1/payments/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formPayload(new FormData(form)))
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Checkout session failed');
    }

    // Stripe-hosted checkout page руу browser redirect хийнэ.
    window.location.href = data.checkoutUrl;
  } catch (error) {
    statusText.className = 'checkout-status error';
    statusText.textContent = error.message;
    button.disabled = false;
  }
});
