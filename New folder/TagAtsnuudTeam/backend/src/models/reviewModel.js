import { pool } from "../config/db.js"; // MySQL connection pool-ийг import хийнэ.

export const createReviewRecord = async ({ booking_id, user_id, rating, comment }) => {
  const [result] = await pool.execute(
    "INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
    [booking_id, user_id, rating, comment]
  );
  const [rows] = await pool.execute("SELECT * FROM reviews WHERE id = ?", [result.insertId]);
  return rows[0] || null; // Шинээр үүссэн review-ийг буцаана.
};

export const getReviewsByBookingId = async (bookingId) => {
  const [rows] = await pool.execute(
    "SELECT r.*, u.name AS user_name FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.booking_id = ? AND r.deleted_at IS NULL ORDER BY r.created_at DESC",
    [bookingId]
  );
  return rows; // Booking-ийн review-үүдийн жагсаалт.
};

export const getReviewByBookingAndUser = async (bookingId, userId) => {
  const [rows] = await pool.execute(
    "SELECT * FROM reviews WHERE booking_id = ? AND user_id = ? AND deleted_at IS NULL",
    [bookingId, userId]
  );
  return rows[0] || null; // Хэрэглэгчийн тухайн booking-д бичсэн review байвал буцаана.
};
