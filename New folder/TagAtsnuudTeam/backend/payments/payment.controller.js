const asyncHandler = require('express-async-handler');
const paymentService = require('./payment.service');
const createHttpError = require('../utils/httpError');

// Admin/payment history list.
const getPayments = asyncHandler(async (req, res) => {
  res.json(await paymentService.getPayments());
});

// Нэг payment-ийг id-аар хайж, байхгүй бол 404 буцаана.
const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);

  if (!payment) {
    throw createHttpError(404, 'Payment not found');
  }

  res.json(payment);
});

// User-ийн өөрийн payment history. Query эсвэл header-оос userId авч болно.
const getMyPayments = asyncHandler(async (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'];

  if (!userId) {
    throw createHttpError(400, 'userId is required');
  }

  res.json(await paymentService.getPaymentsByUser(userId));
});

// Owner payment list. Path, query, header гурваас ownerId унших боломжтой.
const getOwnerPayments = asyncHandler(async (req, res) => {
  const ownerId = req.params.ownerId || req.query.ownerId || req.headers['x-owner-id'];

  if (!ownerId) {
    throw createHttpError(400, 'ownerId is required');
  }

  res.json(await paymentService.getPaymentsByOwner(ownerId));
});

// Admin route нь бүх payment-ийг харуулна.
const getAdminPayments = asyncHandler(async (req, res) => {
  res.json(await paymentService.getPayments());
});

// Platform шимтгэлийн нийт тайлан.
const getCommissionReport = asyncHandler(async (req, res) => {
  res.json(await paymentService.getCommissionReport());
});

// Manual payment record үүсгэх API.
const createPayment = asyncHandler(async (req, res) => {
  res.status(201).json(await paymentService.createPayment(req.body));
});

// Stripe Checkout session үүсгээд redirect URL буцаана.
const createCheckoutSession = asyncHandler(async (req, res) => {
  res.status(201).json(await paymentService.createCheckoutSession(req.body));
});

// Stripe webhook event-ийг service layer боловсруулна.
const handleStripeWebhook = asyncHandler(async (req, res) => {
  await paymentService.handleStripeWebhook(req);
  res.json({ received: true });
});

// Payment status солих үед dashboard/payment cache service дээр цэвэрлэгдэнэ.
const updatePaymentStatus = asyncHandler(async (req, res) => {
  res.json(await paymentService.updatePaymentStatus(req.params.id, req.body));
});

// Payment summary нь dashboard/card дээр ашиглах товч aggregate data.
const getPaymentSummary = asyncHandler(async (req, res) => {
  res.json(await paymentService.getPaymentSummary());
});

// Admin owner payout жагсаалт.
const getOwnerPayouts = asyncHandler(async (req, res) => {
  res.json(await paymentService.getOwnerPayouts());
});

// Нэг owner payout record-ийг id-аар авна.
const getOwnerPayout = asyncHandler(async (req, res) => {
  const payout = await paymentService.getOwnerPayoutById(req.params.id);

  if (!payout) {
    throw createHttpError(404, 'Owner payout not found');
  }

  res.json(payout);
});

// Тухайн owner-ийн payout history.
const getPayoutsByOwner = asyncHandler(async (req, res) => {
  res.json(await paymentService.getPayoutsByOwner(req.params.ownerId));
});

// Owner payout skeleton үүсгэнэ.
const createOwnerPayout = asyncHandler(async (req, res) => {
  res.status(201).json(await paymentService.createOwnerPayout(req.body));
});

// Payout status update хийх endpoint.
const updateOwnerPayoutStatus = asyncHandler(async (req, res) => {
  res.json(await paymentService.updateOwnerPayoutStatus(req.params.id, req.body));
});

module.exports = {
  createCheckoutSession,
  createOwnerPayout,
  createPayment,
  getAdminPayments,
  getCommissionReport,
  getMyPayments,
  getOwnerPayout,
  getOwnerPayouts,
  getOwnerPayments,
  getPayment,
  getPaymentSummary,
  getPayments,
  getPayoutsByOwner,
  handleStripeWebhook,
  updateOwnerPayoutStatus,
  updatePaymentStatus
};
