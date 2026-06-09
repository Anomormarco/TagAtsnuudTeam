const pool = require('../../config/db');

async function getAdminDashboard() {
  const [summaryRows] = await pool.execute(`
    SELECT
      COUNT(*) AS totalPayments,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paidRevenue,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN platform_fee ELSE 0 END), 0) AS platformRevenue,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN owner_amount ELSE 0 END), 0) AS ownerRevenue,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pendingAmount,
      COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) AS failedAmount
    FROM payments
  `);

  const [statusRows] = await pool.execute(`
    SELECT status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount
    FROM payments
    GROUP BY status
  `);

  const [recentPayments] = await pool.execute(`
    SELECT
      id,
      booking_id AS bookingId,
      owner_id AS ownerId,
      amount,
      platform_fee AS platformFee,
      owner_amount AS ownerAmount,
      currency,
      method,
      status,
      created_at AS createdAt
    FROM payments
    ORDER BY created_at DESC
    LIMIT 8
  `);

  const [recentPayouts] = await pool.execute(`
    SELECT
      id,
      owner_id AS ownerId,
      payment_id AS paymentId,
      amount,
      currency,
      status,
      payout_method AS payoutMethod,
      created_at AS createdAt
    FROM owner_payouts
    ORDER BY created_at DESC
    LIMIT 8
  `);

  return {
    ...summaryRows[0],
    paymentStatuses: statusRows,
    recentPayments,
    recentPayouts
  };
}

async function getOwnerDashboard(ownerId) {
  const [summaryRows] = await pool.execute(
    `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN owner_amount ELSE 0 END), 0) AS paidRevenue,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN owner_amount ELSE 0 END), 0) AS pendingRevenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN platform_fee ELSE 0 END), 0) AS paidCommission,
        COUNT(*) AS totalPayments
      FROM payments
      WHERE owner_id = ?
    `,
    [ownerId]
  );

  const [payoutRows] = await pool.execute(
    `
      SELECT
        COALESCE(SUM(CASE WHEN status IN ('pending', 'processing') THEN amount ELSE 0 END), 0) AS pendingPayoutAmount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paidPayoutAmount,
        COUNT(*) AS totalPayouts
      FROM owner_payouts
      WHERE owner_id = ?
    `,
    [ownerId]
  );

  const [payments] = await pool.execute(
    `
      SELECT
        id,
        booking_id AS bookingId,
        hall_id AS hallId,
        amount,
        platform_fee AS platformFee,
        owner_amount AS ownerAmount,
        currency,
        status,
        created_at AS createdAt
      FROM payments
      WHERE owner_id = ?
      ORDER BY created_at DESC
      LIMIT 8
    `,
    [ownerId]
  );

  const [payouts] = await pool.execute(
    `
      SELECT
        id,
        payment_id AS paymentId,
        amount,
        currency,
        status,
        payout_method AS payoutMethod,
        requested_at AS requestedAt,
        paid_at AS paidAt
      FROM owner_payouts
      WHERE owner_id = ?
      ORDER BY created_at DESC
      LIMIT 8
    `,
    [ownerId]
  );

  return {
    ownerId: Number(ownerId),
    ...summaryRows[0],
    ...payoutRows[0],
    payments,
    payouts
  };
}

module.exports = {
  getAdminDashboard,
  getOwnerDashboard
};
