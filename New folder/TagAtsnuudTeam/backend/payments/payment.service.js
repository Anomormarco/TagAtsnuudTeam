const paymentRepository = require('./payment.repository');
const { PAYMENT_METHODS, PAYMENT_STATUSES } = require('./payment.model');
const { PAYOUT_STATUSES } = require('../owner-payouts/ownerPayout.model');
const cache = require('../utils/cache');
const { calculateCommission, money } = require('../utils/commission');
const createHttpError = require('../utils/httpError');

// Stripe zero-decimal currency дээр amount-ийг 100-аар үржүүлэхгүй.
const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
  'mnt'
]);

let stripeClient;

// Payload-д заавал байх талбарууд дутуу бол request-ийг эрт буцаана.
function requireFields(payload, fields) {
  const missingField = fields.find((field) => payload[field] === undefined || payload[field] === null);

  if (missingField) {
    throw createHttpError(400, `${missingField} is required`);
  }
}

// Төлбөрийн дүн 0 эсвэл сөрөг байж болохгүй.
function ensurePositiveAmount(amount) {
  if (Number(amount) <= 0) {
    throw createHttpError(400, 'amount must be greater than 0');
  }
}

// Stripe client-ийг lazy init хийж, secret key байхгүй үед ойлгомжтой error өгнө.
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw createHttpError(500, 'STRIPE_SECRET_KEY is not configured');
  }

  if (!stripeClient) {
    const Stripe = require('stripe');
    stripeClient = Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

// Stripe API-д илгээх amount format-ийг currency төрлөөс хамааруулж бэлдэнэ.
function toStripeAmount(amount, currency) {
  const normalizedCurrency = String(currency || 'MNT').toLowerCase();
  return ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)
    ? Math.round(Number(amount))
    : Math.round(Number(amount) * 100);
}

// Success/cancel redirect хийх frontend base URL.
function getBaseUrl(payload) {
  return (
    payload.baseUrl ||
    process.env.APP_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

// Payment record үүсгэхдээ platform fee болон owner amount-ийг нэг дор тооцоолно.
async function createPayment(payload) {
  requireFields(payload, ['bookingId', 'userId', 'hallId', 'ownerId', 'amount']);
  ensurePositiveAmount(payload.amount);

  const commission = calculateCommission(payload.amount, payload.platformFee);
  const method = payload.method || 'stripe';
  const status = payload.status || 'pending';

  if (!PAYMENT_METHODS.includes(method)) {
    throw createHttpError(400, 'Invalid payment method');
  }

  if (!PAYMENT_STATUSES.includes(status)) {
    throw createHttpError(400, 'Invalid payment status');
  }

  // Owner amount override ирвэл platform fee-г түүнд тааруулж дахин тооцно.
  const payment = await paymentRepository.createPayment({
    bookingId: payload.bookingId,
    userId: payload.userId,
    hallId: payload.hallId,
    ownerId: payload.ownerId,
    amount: commission.amount,
    platformFee: payload.ownerAmount !== undefined
      ? money(commission.amount - payload.ownerAmount)
      : commission.platformFee,
    ownerAmount: payload.ownerAmount !== undefined ? money(payload.ownerAmount) : commission.ownerAmount,
    currency: payload.currency || 'MNT',
    method,
    status,
    transactionId: payload.transactionId || null,
    paidAt: payload.paidAt || (status === 'paid' ? new Date() : null)
  });

  cache.clearPaymentCache();
  return payment;
}

// Stripe checkout session үүсгэхээс өмнө pending payment skeleton хадгална.
async function createCheckoutSession(payload) {
  requireFields(payload, ['bookingId', 'userId', 'hallId', 'ownerId', 'amount']);
  ensurePositiveAmount(payload.amount);

  const currency = payload.currency || process.env.STRIPE_CURRENCY || 'MNT';
  const payment = await createPayment({
    ...payload,
    currency,
    method: 'stripe',
    status: 'pending'
  });
  const baseUrl = getBaseUrl(payload);
  const stripe = getStripe();

  // Stripe checkout-д харагдах product, amount, redirect URL болон metadata.
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: payload.name || `Hall booking #${payload.bookingId}`
          },
          unit_amount: toStripeAmount(payment.amount, currency)
        },
        quantity: 1
      }
    ],
    metadata: {
      paymentId: String(payment.id),
      bookingId: String(payment.bookingId),
      ownerId: String(payment.ownerId)
    },
    success_url: `${baseUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout-cancel?payment_id=${payment.id}`
  });

  await paymentRepository.updatePaymentStatus(payment.id, 'pending', session.id);

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    payment
  };
}

// Manual status update endpoint-ийн бизнес шалгалт.
async function updatePaymentStatus(id, payload) {
  if (!PAYMENT_STATUSES.includes(payload.status)) {
    throw createHttpError(400, 'Invalid payment status');
  }

  const payment = await paymentRepository.updatePaymentStatus(id, payload.status, payload.transactionId);

  if (!payment) {
    throw createHttpError(404, 'Payment not found');
  }

  cache.clearPaymentCache();
  return payment;
}

// Webhook payment success ирэхэд payment paid болгож, owner payout skeleton үүсгэнэ.
async function markPaymentPaid(paymentId, transactionId) {
  const payment = await paymentRepository.updatePaymentStatus(paymentId, 'paid', transactionId);

  if (!payment) {
    return null;
  }

  cache.clearPaymentCache();

  const existingPayout = await paymentRepository.getOwnerPayoutByPaymentId(payment.id);

  if (!existingPayout) {
    await createOwnerPayout({
      ownerId: payment.ownerId,
      paymentId: payment.id,
      amount: payment.ownerAmount,
      currency: payment.currency,
      status: 'pending',
      payoutMethod: 'stripe',
      note: `Commission ${payment.platformFee} ${payment.currency}`
    });
  }

  return payment;
}

// Stripe webhook signature байгаа бол шалгана, test/mock үед raw JSON-ийг шууд parse хийнэ.
async function handleStripeWebhook(req) {
  const signature = req.headers['stripe-signature'];
  let event;

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const stripe = getStripe();
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
      throw createHttpError(400, 'Invalid Stripe webhook signature', error.message);
    }
  } else {
    try {
      event = JSON.parse(req.body.toString('utf8'));
    } catch (error) {
      throw createHttpError(400, 'Invalid Stripe webhook payload', error.message);
    }
  }

  if (!event || !event.data || !event.data.object) {
    throw createHttpError(400, 'Invalid Stripe webhook event');
  }

  const session = event.data.object;
  const paymentId = session.metadata && session.metadata.paymentId;

  // Metadata-д paymentId байхгүй event-ийг энэ service боловсруулахгүй.
  if (!paymentId) {
    return;
  }

  if (event.type === 'checkout.session.completed') {
    await markPaymentPaid(paymentId, session.payment_intent || session.id);
  }

  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    await paymentRepository.updatePaymentStatus(paymentId, 'failed', session.id);
    cache.clearPaymentCache();
  }
}

// Owner-д шилжүүлэх payout record үүсгэнэ.
async function createOwnerPayout(payload) {
  requireFields(payload, ['ownerId', 'amount', 'payoutMethod']);
  ensurePositiveAmount(payload.amount);

  const status = payload.status || 'pending';

  if (!PAYOUT_STATUSES.includes(status)) {
    throw createHttpError(400, 'Invalid payout status');
  }

  const payout = await paymentRepository.createOwnerPayout({
    ownerId: payload.ownerId,
    paymentId: payload.paymentId || null,
    amount: money(payload.amount),
    currency: payload.currency || 'MNT',
    status,
    payoutMethod: payload.payoutMethod,
    bankAccount: payload.bankAccount || null,
    note: payload.note || null,
    paidAt: payload.paidAt || (status === 'paid' ? new Date() : null)
  });

  cache.clearPaymentCache();
  return payout;
}

// Payout status солигдоход dashboard/payment cache мөн шинэчлэгдэх ёстой.
async function updateOwnerPayoutStatus(id, payload) {
  if (!PAYOUT_STATUSES.includes(payload.status)) {
    throw createHttpError(400, 'Invalid payout status');
  }

  const payout = await paymentRepository.updateOwnerPayoutStatus(id, payload.status);

  if (!payout) {
    throw createHttpError(404, 'Owner payout not found');
  }

  cache.clearPaymentCache();
  return payout;
}

module.exports = {
  calculateCommission,
  createCheckoutSession,
  createOwnerPayout,
  createPayment,
  // Read талын query-үүдийг cache.remember-ээр ороож performance сайжруулна.
  getCommissionReport: () => cache.remember('commission-report', undefined, paymentRepository.getCommissionReport),
  getOwnerPayoutById: paymentRepository.getOwnerPayoutById,
  getOwnerPayouts: () => cache.remember('payments:owner-payouts:all', undefined, paymentRepository.getOwnerPayouts),
  getPaymentById: (id) => cache.remember(`payment:${id}`, undefined, () => paymentRepository.getPaymentById(id)),
  getPaymentSummary: () => cache.remember('payments:summary', undefined, paymentRepository.getPaymentSummary),
  getPayments: () => cache.remember('payments:all', undefined, paymentRepository.getPayments),
  getPaymentsByOwner: (ownerId) => cache.remember(`payments:owner:${ownerId}`, undefined, () => paymentRepository.getPaymentsByOwner(ownerId)),
  getPaymentsByUser: (userId) => cache.remember(`payments:user:${userId}`, undefined, () => paymentRepository.getPaymentsByUser(userId)),
  getPayoutsByOwner: (ownerId) => cache.remember(`payments:payouts:owner:${ownerId}`, undefined, () => paymentRepository.getPayoutsByOwner(ownerId)),
  handleStripeWebhook,
  updateOwnerPayoutStatus,
  updatePaymentStatus
};
