const express = require('express');
const paymentController = require('./payment.controller');

const router = express.Router();

// Payment унших болон тайлангийн endpoint-ууд.
router.get('/summary', paymentController.getPaymentSummary);
router.get('/my', paymentController.getMyPayments);
router.get('/owner', paymentController.getOwnerPayments);
router.get('/owner/:ownerId', paymentController.getOwnerPayments);
router.get('/admin', paymentController.getAdminPayments);
router.get('/commission-report', paymentController.getCommissionReport);
router.post('/checkout-session', paymentController.createCheckoutSession);

// Owner payout CRUD/status endpoint-ууд.
router.get('/owner-payouts/all', paymentController.getOwnerPayouts);
router.get('/owner-payouts/owner/:ownerId', paymentController.getPayoutsByOwner);
router.get('/owner-payouts/:id', paymentController.getOwnerPayout);
router.post('/owner-payouts', paymentController.createOwnerPayout);
router.patch('/owner-payouts/:id/status', paymentController.updateOwnerPayoutStatus);

// Generic payment CRUD/status endpoint-уудыг хамгийн сүүлд байрлуулна.
router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPayment);
router.post('/', paymentController.createPayment);
router.patch('/:id/status', paymentController.updatePaymentStatus);

module.exports = router;
