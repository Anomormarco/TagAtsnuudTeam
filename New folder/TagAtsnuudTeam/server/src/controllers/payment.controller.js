const asyncHandler = require('express-async-handler');
const paymentService = require('./payment.service');
const createHttpError = require('../utils/httpError');

const getPayments = asyncHandler(async (req, res) => {
  res.json(await paymentService.getPayments());
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);

  if (!payment) {
    throw createHttpError(404, 'Payment not found');
  }

  res.json(payment);
});

const getMyPayments = asyncHandler(async (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'];

  if (!userId) {
    throw createHttpError(400, 'userId is required');
  }

  res.json(await paymentService.getPaymentsByUser(userId));
});

const getOwnerPayments = asyncHandler(async (req, res) => {
  const ownerId = req.params.ownerId || req.query.ownerId || req.headers['x-owner-id'];

  if (!ownerId) {
    throw createHttpError(400, 'ownerId is required');
  }

  res.json(await paymentService.getPaymentsByOwner(ownerId));
});

const getAdminPayments = asyncHandler(async (req, res) => {
  res.json(await paymentService.getPayments());
});

const getCommissionReport = asyncHandler(async (req, res) => {
  res.json(await paymentService.getCommissionReport());
});

const createPayment = asyncHandler(async (req, res) => {
  res.status(201).json(await paymentService.createPayment(req.body));
});

const createCheckoutSession = asyncHandler(async (req, res) => {
  res.status(201).json(await paymentService.createCheckoutSession(req.body));
});

const handleStripeWebhook = asyncHandler(async (req, res) => {
  await paymentService.handleStripeWebhook(req);
  res.json({ received: true });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  res.json(await paymentService.updatePaymentStatus(req.params.id, req.body));
});

const getPaymentSummary = asyncHandler(async (req, res) => {
  res.json(await paymentService.getPaymentSummary());
});

const getOwnerPayouts = asyncHandler(async (req, res) => {
  res.json(await paymentService.getOwnerPayouts());
});

const getOwnerPayout = asyncHandler(async (req, res) => {
  const payout = await paymentService.getOwnerPayoutById(req.params.id);

  if (!payout) {
    throw createHttpError(404, 'Owner payout not found');
  }

  res.json(payout);
});

const getPayoutsByOwner = asyncHandler(async (req, res) => {
  res.json(await paymentService.getPayoutsByOwner(req.params.ownerId));
});

const createOwnerPayout = asyncHandler(async (req, res) => {
  res.status(201).json(await paymentService.createOwnerPayout(req.body));
});

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
