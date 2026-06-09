const pool = require('../../config/db');

const paymentSelect = `
  SELECT
    id,
    booking_id AS bookingId,
    user_id AS userId,
    hall_id AS hallId,
    owner_id AS ownerId,
    amount,
    platform_fee AS platformFee,
    owner_amount AS ownerAmount,
    currency,
    method,
    status,
    transaction_id AS transactionId,
    paid_at AS paidAt,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM payments
`;

const payoutSelect = `
  SELECT
    id,
    owner_id AS ownerId,
    payment_id AS paymentId,
    amount,
    currency,
    status,
    payout_method AS payoutMethod,
    bank_account AS bankAccount,
    note,
    requested_at AS requestedAt,
    paid_at AS paidAt,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM owner_payouts
`;

async function getPayments() {
  const [rows] = await pool.execute(`${paymentSelect} ORDER BY created_at DESC`);
  return rows;
}

async function getPaymentById(id) {
  const [rows] = await pool.execute(`${paymentSelect} WHERE id = ?`, [id]);
  return rows[0];
}

async function getPaymentsByUser(userId) {
  const [rows] = await pool.execute(`${paymentSelect} WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
  return rows;
}

async function getPaymentsByOwner(ownerId) {
  const [rows] = await pool.execute(`${paymentSelect} WHERE owner_id = ? ORDER BY created_at DESC`, [ownerId]);
  return rows;
}

async function createPayment(payment) {
  const [result] = await pool.execute(
    `INSERT INTO payments
      (booking_id, user_id, hall_id, owner_id, amount, platform_fee, owner_amount, currency, method, status, transaction_id, paid_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payment.bookingId,
      payment.userId,
      payment.hallId,
      payment.ownerId,
      payment.amount,
      payment.platformFee,
      payment.ownerAmount,
      payment.currency,
      payment.method,
      payment.status,
      payment.transactionId,
      payment.paidAt
    ]
  );

  return getPaymentById(result.insertId);
}

async function updatePaymentStatus(id, status, transactionId = null) {
  const paidAt = status === 'paid' ? new Date() : null;
  await pool.execute(
    `UPDATE payments
     SET status = ?, transaction_id = COALESCE(?, transaction_id), paid_at = COALESCE(?, paid_at)
     WHERE id = ?`,
    [status, transactionId, paidAt, id]
  );

  return getPaymentById(id);
}

async function getPaymentSummary() {
  const [rows] = await pool.execute(`
    SELECT
      COUNT(*) AS totalPayments,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paidRevenue,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN platform_fee ELSE 0 END), 0) AS platformRevenue,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN owner_amount ELSE 0 END), 0) AS ownerRevenue,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pendingAmount
    FROM payments
  `);

  return rows[0];
}

async function getCommissionReport() {
  const [summaryRows] = await pool.execute(`
    SELECT
      COUNT(*) AS totalPayments,
      COALESCE(SUM(amount), 0) AS grossRevenue,
      COALESCE(SUM(platform_fee), 0) AS totalCommission,
      COALESCE(SUM(owner_amount), 0) AS totalOwnerAmount,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN platform_fee ELSE 0 END), 0) AS paidCommission,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN platform_fee ELSE 0 END), 0) AS pendingCommission
    FROM payments
  `);

  const [owners] = await pool.execute(`
    SELECT
      owner_id AS ownerId,
      COUNT(*) AS paymentCount,
      COALESCE(SUM(amount), 0) AS grossRevenue,
      COALESCE(SUM(platform_fee), 0) AS commission,
      COALESCE(SUM(owner_amount), 0) AS ownerAmount
    FROM payments
    GROUP BY owner_id
    ORDER BY grossRevenue DESC
  `);

  return {
    ...summaryRows[0],
    owners
  };
}

async function getOwnerPayouts() {
  const [rows] = await pool.execute(`${payoutSelect} ORDER BY created_at DESC`);
  return rows;
}

async function getOwnerPayoutById(id) {
  const [rows] = await pool.execute(`${payoutSelect} WHERE id = ?`, [id]);
  return rows[0];
}

async function getPayoutsByOwner(ownerId) {
  const [rows] = await pool.execute(`${payoutSelect} WHERE owner_id = ? ORDER BY created_at DESC`, [ownerId]);
  return rows;
}

async function getOwnerPayoutByPaymentId(paymentId) {
  const [rows] = await pool.execute(`${payoutSelect} WHERE payment_id = ? LIMIT 1`, [paymentId]);
  return rows[0];
}

async function createOwnerPayout(payout) {
  const [result] = await pool.execute(
    `INSERT INTO owner_payouts
      (owner_id, payment_id, amount, currency, status, payout_method, bank_account, note, paid_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payout.ownerId,
      payout.paymentId,
      payout.amount,
      payout.currency,
      payout.status,
      payout.payoutMethod,
      payout.bankAccount,
      payout.note,
      payout.paidAt
    ]
  );

  return getOwnerPayoutById(result.insertId);
}

async function updateOwnerPayoutStatus(id, status) {
  const paidAt = status === 'paid' ? new Date() : null;
  await pool.execute(
    `UPDATE owner_payouts
     SET status = ?, paid_at = COALESCE(?, paid_at)
     WHERE id = ?`,
    [status, paidAt, id]
  );

  return getOwnerPayoutById(id);
}

module.exports = {
  createOwnerPayout,
  createPayment,
  getCommissionReport,
  getOwnerPayoutByPaymentId,
  getOwnerPayoutById,
  getOwnerPayouts,
  getPaymentById,
  getPaymentSummary,
  getPayments,
  getPaymentsByOwner,
  getPaymentsByUser,
  getPayoutsByOwner,
  updateOwnerPayoutStatus,
  updatePaymentStatus
};
