const pool = require("../config/db");

async function getAdminDashboard() {
  const [summaryRows] = await pool.execute(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS totalUsers,
      (SELECT COUNT(*) FROM halls WHERE deleted_at IS NULL) AS totalHalls,
      (SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL) AS totalBookings,
      COUNT(p.id) AS totalPayments,
      COALESCE(SUM(CASE WHEN p.payment_status = 'PAID' THEN p.amount ELSE 0 END), 0) AS paidRevenue,
      COALESCE(SUM(CASE WHEN p.payment_status = 'PAID' THEN p.commission_amount ELSE 0 END), 0) AS platformRevenue,
      COALESCE(SUM(CASE WHEN p.payment_status = 'PAID' THEN p.owner_amount ELSE 0 END), 0) AS ownerRevenue,
      COALESCE(SUM(CASE WHEN p.payment_status = 'PENDING' THEN p.amount ELSE 0 END), 0) AS pendingAmount,
      COALESCE(SUM(CASE WHEN p.payment_status IN ('FAILED', 'CANCELLED') THEN p.amount ELSE 0 END), 0) AS failedAmount
    FROM payments p
    WHERE p.deleted_at IS NULL
  `);

  const [statusRows] = await pool.execute(`
    SELECT LOWER(payment_status) AS status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount
    FROM payments
    WHERE deleted_at IS NULL
    GROUP BY payment_status
  `);

  const [recentPayments] = await pool.execute(`
    SELECT
      p.id,
      p.booking_id AS bookingId,
      b.hall_id AS hallId,
      h.name AS hallName,
      p.owner_id AS ownerId,
      p.amount,
      p.commission_amount AS platformFee,
      p.owner_amount AS ownerAmount,
      p.currency,
      LOWER(p.payment_status) AS status,
      p.created_at AS createdAt
    FROM payments p
    LEFT JOIN bookings b ON b.id = p.booking_id
    LEFT JOIN halls h ON h.id = b.hall_id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
    LIMIT 8
  `);

  const [recentPayouts] = await pool.execute(`
    SELECT
      op.id,
      op.owner_id AS ownerId,
      op.payment_id AS paymentId,
      op.amount,
      LOWER(op.status) AS status,
      op.stripe_transfer_id AS transferId,
      op.created_at AS createdAt
    FROM owner_payouts op
    ORDER BY op.created_at DESC
    LIMIT 8
  `);

  return {
    ...summaryRows[0],
    paymentStatuses: statusRows,
    recentPayments,
    recentPayouts,
  };
}

async function getOwnerDashboard(ownerId) {
  const [summaryRows] = await pool.execute(
    `
      SELECT
        (SELECT COUNT(*) FROM halls WHERE owner_id = ? AND deleted_at IS NULL) AS totalHalls,
        (SELECT COUNT(*) FROM bookings b JOIN halls h ON h.id = b.hall_id WHERE h.owner_id = ? AND b.deleted_at IS NULL) AS totalBookings,
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN owner_amount ELSE 0 END), 0) AS paidRevenue,
        COALESCE(SUM(CASE WHEN payment_status = 'PENDING' THEN owner_amount ELSE 0 END), 0) AS pendingRevenue,
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN commission_amount ELSE 0 END), 0) AS paidCommission,
        COUNT(*) AS totalPayments
      FROM payments
      WHERE owner_id = ? AND deleted_at IS NULL
    `,
    [ownerId, ownerId, ownerId]
  );

  const [payoutRows] = await pool.execute(
    `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END), 0) AS pendingPayoutAmount,
        COALESCE(SUM(CASE WHEN status = 'TRANSFERRED' THEN amount ELSE 0 END), 0) AS paidPayoutAmount,
        COUNT(*) AS totalPayouts
      FROM owner_payouts
      WHERE owner_id = ?
    `,
    [ownerId]
  );

  const [halls] = await pool.execute(
    `
      SELECT
        h.id,
        h.name,
        h.capacity,
        h.price_per_hour AS pricePerHour,
        h.status,
        COUNT(b.id) AS bookings,
        COALESCE(SUM(CASE WHEN b.status IN ('PAID', 'COMPLETED') THEN b.total_price ELSE 0 END), 0) AS earnings
      FROM halls h
      LEFT JOIN bookings b ON b.hall_id = h.id AND b.deleted_at IS NULL
      WHERE h.owner_id = ? AND h.deleted_at IS NULL
      GROUP BY h.id
      ORDER BY h.created_at DESC
      LIMIT 8
    `,
    [ownerId]
  );

  const [payments] = await pool.execute(
    `
      SELECT
        p.id,
        p.booking_id AS bookingId,
        b.hall_id AS hallId,
        h.name AS hallName,
        p.amount,
        p.commission_amount AS platformFee,
        p.owner_amount AS ownerAmount,
        p.currency,
        LOWER(p.payment_status) AS status,
        p.created_at AS createdAt
      FROM payments p
      LEFT JOIN bookings b ON b.id = p.booking_id
      LEFT JOIN halls h ON h.id = b.hall_id
      WHERE p.owner_id = ? AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
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
        LOWER(status) AS status,
        transferred_at AS paidAt,
        created_at AS createdAt
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
    halls,
    payments,
    payouts,
  };
}

module.exports = {
  getAdminDashboard,
  getOwnerDashboard,
};
