const pool = require("../config/db");

const createReview = async ({ hall_id, user_id, rating, comment }) => {
  const [result] = await pool.execute(
    "INSERT INTO reviews (hall_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
    [hall_id, user_id, rating, comment || null]
  );
  const [rows] = await pool.execute("SELECT * FROM reviews WHERE id = ?", [result.insertId]);
  return rows[0] || null;
};

const getReviewsByHallId = async (hallId) => {
  const [rows] = await pool.execute(
    `SELECT r.id, r.hall_id AS hallId, r.user_id AS userId, r.rating, r.comment, r.created_at AS createdAt, u.name AS userName
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.hall_id = ? AND r.deleted_at IS NULL
     ORDER BY r.created_at DESC`,
    [hallId]
  );
  return rows;
};

const getReviewByHallAndUser = async (hallId, userId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM reviews WHERE hall_id = ? AND user_id = ? AND deleted_at IS NULL",
    [hallId, userId]
  );
  return rows[0] || null;
};

module.exports = {
  createReview,
  getReviewByBookingAndUser: getReviewByHallAndUser,
  getReviewByHallAndUser,
  getReviewsByBookingId: getReviewsByHallId,
  getReviewsByHallId,
};
