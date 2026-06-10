const pool = require("../config/db");

const paymentSelect = `
  SELECT
    p.id,
    p.booking_id AS bookingId,
    p.user_id AS userId,
    b.hall_id AS hallId,
    p.owner_id AS ownerId,
    p.amount,
    p.commission_rate AS commissionRate,
    p.commission_amount AS platformFee,
    p.owner_amount AS ownerAmount,
    p.currency,
    'stripe' AS method,
    LOWER(p.payment_status) AS status,
    p.stripe_session_id AS sessionId,
    p.stripe_payment_intent_id AS transactionId,
    p.paid_at AS paidAt,
    p.created_at AS createdAt,
    p.updated_at AS updatedAt
  FROM payments p
  LEFT JOIN bookings b ON b.id = p.booking_id
`;

const payoutSelect = `
  SELECT
    id,
    owner_id AS ownerId,
    payment_id AS paymentId,
    amount,
    'MNT' AS currency,
    LOWER(status) AS status,
    'stripe' AS payoutMethod,
    stripe_transfer_id AS transferId,
    transferred_at AS paidAt,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM owner_payouts
`;

const normalizePaymentStatus = (status) => String(status || "PENDING").toUpperCase();
const toPaidAt = (status) => normalizePaymentStatus(status) === "PAID" ? new Date() : null;

async function getPayments() {
  const [rows] = await pool.execute(`${paymentSelect} WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC`);
  return rows;
}

async function getPaymentById(id) {
  const [rows] = await pool.execute(`${paymentSelect} WHERE p.id = ? AND p.deleted_at IS NULL`, [id]);
  return rows[0] || null;
}

async function getPaymentByBookingId(bookingId) {
  const [rows] = await pool.execute(`${paymentSelect} WHERE p.booking_id = ? AND p.deleted_at IS NULL LIMIT 1`, [bookingId]);
  return rows[0] || null;
}

async function getPaymentsByUser(userId) {
  const [rows] = await pool.execute(`${paymentSelect} WHERE p.user_id = ? AND p.deleted_at IS NULL ORDER BY p.created_at DESC`, [userId]);
  return rows;
}

async function getPaymentsByOwner(ownerId) {
  const [rows] = await pool.execute(`${paymentSelect} WHERE p.owner_id = ? AND p.deleted_at IS NULL ORDER BY p.created_at DESC`, [ownerId]);
  return rows;
}

async function createPayment(payment) {
  const [maxRows] = await pool.execute("SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM payments");
  const nextId = maxRows[0].nextId;
  const commissionRate = payment.commissionRate || 10;
  const platformFee = payment.platformFee ?? payment.commissionAmount ?? Number(payment.amount) * commissionRate / 100;
  const ownerAmount = payment.ownerAmount ?? Number(payment.amount) - Number(platformFee);
  const [result] = await pool.execute(
    `INSERT INTO payments
      (id, booking_id, user_id, owner_id, amount, commission_rate, commission_amount, owner_amount, currency, stripe_session_id, stripe_payment_intent_id, payment_status, paid_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nextId,
      payment.bookingId,
      payment.userId,
      payment.ownerId,
      payment.amount,
      commissionRate,
      platformFee,
      ownerAmount,
      payment.currency || "MNT",
      payment.sessionId || null,
      payment.transactionId || null,
      normalizePaymentStatus(payment.status),
      payment.paidAt || toPaidAt(payment.status),
    ]
  );
  return getPaymentById(result.insertId || nextId);
}

async function updatePaymentStatus(id, status, transactionId = null) {
  const normalizedStatus = normalizePaymentStatus(status);
  await pool.execute(
    `UPDATE payments
     SET payment_status = ?, stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id), paid_at = COALESCE(?, paid_at)
     WHERE id = ? AND deleted_at IS NULL`,
    [normalizedStatus, transactionId, toPaidAt(status), id]
  );

  if (normalizedStatus === "PAID") {
    await pool.execute(
      `UPDATE bookings b
       JOIN payments p ON p.booking_id = b.id
       SET b.status = 'PAID', b.updated_at = CURRENT_TIMESTAMP
       WHERE p.id = ? AND b.deleted_at IS NULL`,
      [id]
    );
  }

  return getPaymentById(id);
}

async function getPaymentSummary() {
  const [rows] = await pool.execute(`
    SELECT
      COUNT(*) AS totalPayments,
      COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN amount ELSE 0 END), 0) AS paidRevenue,
      COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN commission_amount ELSE 0 END), 0) AS platformRevenue,
      COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN owner_amount ELSE 0 END), 0) AS ownerRevenue,
      COALESCE(SUM(CASE WHEN payment_status = 'PENDING' THEN amount ELSE 0 END), 0) AS pendingAmount
    FROM payments
    WHERE deleted_at IS NULL
  `);
  return rows[0];
}

async function getCommissionReport() {
  const [summaryRows] = await pool.execute(`
    SELECT
      COUNT(*) AS totalPayments,
      COALESCE(SUM(amount), 0) AS grossRevenue,
      COALESCE(SUM(commission_amount), 0) AS totalCommission,
      COALESCE(SUM(owner_amount), 0) AS totalOwnerAmount,
      COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN commission_amount ELSE 0 END), 0) AS paidCommission,
      COALESCE(SUM(CASE WHEN payment_status = 'PENDING' THEN commission_amount ELSE 0 END), 0) AS pendingCommission
    FROM payments
    WHERE deleted_at IS NULL
  `);

  const [owners] = await pool.execute(`
    SELECT
      owner_id AS ownerId,
      COUNT(*) AS paymentCount,
      COALESCE(SUM(amount), 0) AS grossRevenue,
      COALESCE(SUM(commission_amount), 0) AS commission,
      COALESCE(SUM(owner_amount), 0) AS ownerAmount
    FROM payments
    WHERE deleted_at IS NULL
    GROUP BY owner_id
    ORDER BY grossRevenue DESC
  `);

  return { ...summaryRows[0], owners };
}

async function getOwnerPayouts() {
  const [rows] = await pool.execute(`${payoutSelect} ORDER BY created_at DESC`);
  return rows;
}

async function getOwnerPayoutById(id) {
  const [rows] = await pool.execute(`${payoutSelect} WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function getPayoutsByOwner(ownerId) {
  const [rows] = await pool.execute(`${payoutSelect} WHERE owner_id = ? ORDER BY created_at DESC`, [ownerId]);
  return rows;
}

async function getOwnerPayoutByPaymentId(paymentId) {
  const [rows] = await pool.execute(`${payoutSelect} WHERE payment_id = ? LIMIT 1`, [paymentId]);
  return rows[0] || null;
}

async function createOwnerPayout(payout) {
  const [result] = await pool.execute(
    `INSERT INTO owner_payouts (owner_id, payment_id, amount, status, stripe_transfer_id, transferred_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payout.ownerId,
      payout.paymentId,
      payout.amount,
      String(payout.status || "PENDING").toUpperCase(),
      payout.transferId || null,
      payout.paidAt || null,
    ]
  );
  return getOwnerPayoutById(result.insertId);
}

async function updateOwnerPayoutStatus(id, status) {
  const normalized = String(status || "PENDING").toUpperCase();
  await pool.execute(
    "UPDATE owner_payouts SET status = ?, transferred_at = COALESCE(?, transferred_at) WHERE id = ?",
    [normalized, normalized === "TRANSFERRED" ? new Date() : null, id]
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
  getPaymentByBookingId,
  getPaymentSummary,
  getPayments,
  getPaymentsByOwner,
  getPaymentsByUser,
  getPayoutsByOwner,
  updateOwnerPayoutStatus,
  updatePaymentStatus,
};
