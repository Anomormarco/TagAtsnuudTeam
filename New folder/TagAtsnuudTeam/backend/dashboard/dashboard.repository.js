const pool = require('../../config/db');

// Admin dashboard-д хэрэгтэй нийт орлого, шимтгэл, сүүлийн payment/payout data-г DB-ээс авна.
async function getAdminDashboard() {
  // Summary query нь card дээр харагдах нийт тоонуудыг тооцоолно.
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

  // Payment status бүрээр count болон amount задлана.
  const [statusRows] = await pool.execute(`
    SELECT status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount
    FROM payments
    GROUP BY status
  `);

  // Admin-д харуулах хамгийн сүүлийн payment-үүд.
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

  // Admin-д харуулах хамгийн сүүлийн owner payout-ууд.
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

// Owner dashboard нь зөвхөн тухайн owner-ийн payment болон payout мэдээллийг нэгтгэнэ.
async function getOwnerDashboard(ownerId) {
  // Owner-ийн орлого болон шимтгэлийн summary.
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

  // Owner payout-ийн хүлээгдэж буй болон төлөгдсөн дүн.
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

  // Owner-ийн сүүлийн payment history.
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

  // Owner-ийн payout history.
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
