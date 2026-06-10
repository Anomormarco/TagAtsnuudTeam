const paymentRepository = require('../repositories/payment.repository');
const { PAYMENT_METHODS, PAYMENT_STATUSES } = require('../models/payment.model');
const { PAYOUT_STATUSES } = require('../models/ownerPayout.model');
const cache = require('../utils/cache');
const createHttpError = require('../utils/httpError');

function money(amount) {
  return Number(Number(amount || 0).toFixed(2));
}

function calculateCommission(amount, platformFee) {
  const normalizedAmount = money(amount);
  const normalizedPlatformFee = platformFee === undefined || platformFee === null
    ? money(normalizedAmount * 0.1)
    : money(platformFee);

  return {
    amount: normalizedAmount,
    platformFee: normalizedPlatformFee,
    ownerAmount: money(normalizedAmount - normalizedPlatformFee)
  };
}

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

function requireFields(payload, fields) {
  const missingField = fields.find((field) => payload[field] === undefined || payload[field] === null);

  if (missingField) {
    throw createHttpError(400, `${missingField} is required`);
  }
}

function ensurePositiveAmount(amount) {
  if (Number(amount) <= 0) {
    throw createHttpError(400, 'amount must be greater than 0');
  }
}

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw createHttpError(500, 'STRIPE_SECRET_KEY is not configured');
  }

  if (!stripeClient) {
    let Stripe;
    try {
      Stripe = require('stripe');
    } catch (error) {
      throw createHttpError(500, 'stripe package is not installed');
    }
    stripeClient = Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

function toStripeAmount(amount, currency) {
  const normalizedCurrency = String(currency || 'MNT').toLowerCase();
  return ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)
    ? Math.round(Number(amount))
    : Math.round(Number(amount) * 100);
}

function getBaseUrl(payload) {
  return (
    payload.baseUrl ||
    process.env.APP_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

async function createPayment(payload) {
  requireFields(payload, ['bookingId', 'userId', 'hallId', 'ownerId', 'amount']);
  ensurePositiveAmount(payload.amount);

  const existingPayment = await paymentRepository.getPaymentByBookingId(payload.bookingId);
  if (existingPayment) {
    return existingPayment;
  }

  const commission = calculateCommission(payload.amount, payload.platformFee);
  const method = payload.method || 'stripe';
  const status = payload.status || 'pending';

  if (!PAYMENT_METHODS.includes(method)) {
    throw createHttpError(400, 'Invalid payment method');
  }

  if (!PAYMENT_STATUSES.includes(status)) {
    throw createHttpError(400, 'Invalid payment status');
  }

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

  if (status === 'paid') {
    await paymentRepository.updatePaymentStatus(payment.id, 'paid', payload.transactionId || null);
  }

  cache.clearPaymentCache();
  return payment;
}

async function createCheckoutSession(payload) {
  requireFields(payload, ['bookingId', 'userId', 'hallId', 'ownerId', 'amount']);
  ensurePositiveAmount(payload.amount);

  const currency = payload.currency || process.env.STRIPE_CURRENCY || 'MNT';
  const existingPayment = await paymentRepository.getPaymentByBookingId(payload.bookingId);
  const payment = existingPayment || await createPayment({
    ...payload,
    currency,
    method: 'stripe',
    status: 'pending'
  });
  const baseUrl = getBaseUrl(payload);

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_key_here') {
    return {
      checkoutUrl: `${baseUrl}/checkout-success?mock=true&payment_id=${payment.id}`,
      sessionId: `mock_session_${payment.id}`,
      payment
    };
  }

  const stripe = getStripe();

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
