import { pool } from "../config/db.js"; // MySQL connection pool-ийг import хийнэ.

export const bookingStatuses = ["PENDING", "PAID", "CANCELLED", "COMPLETED"]; // Захиалгын зөв статустай утгууд.

export const createBooking = async ({ user_id, hall_id, start_time, end_time, total_price }) => {
  const [result] = await pool.execute(
    "INSERT INTO bookings (user_id, hall_id, start_time, end_time, total_price, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
    [user_id, hall_id, start_time, end_time, total_price]
  ); // Хэрэглэгчийн захиалгыг PENDING статустай insert хийдэг.
  return getBookingById(result.insertId); // Шинэ үүссэн захиалгыг id-аар дахин татаад буцаана.
};

export const getBookingsByUserId = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT b.*, h.name AS hall_name, h.location AS hall_location FROM bookings b LEFT JOIN halls h ON h.id = b.hall_id WHERE b.user_id = ? AND b.deleted_at IS NULL ORDER BY b.start_time DESC",
    [userId]
  ); // Хэрэглэгчийн идэвхтэй захиалгуудыг hall мэдээлэлтэйгээр татна.
  return rows; // Захиалга массивыг буцаана.
};

export const getBookingById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT b.*, h.name AS hall_name, h.location AS hall_location FROM bookings b LEFT JOIN halls h ON h.id = b.hall_id WHERE b.id = ? AND b.deleted_at IS NULL",
    [id]
  ); // Тухайн id-тай booking-ийг hall мэдээлэлтэй хамт татна.
  return rows[0] || null; // Олдсон мөр байвал буцаана, үгүй бол null.
};

export const hasOverlappingBooking = async ({ hall_id, start_time, end_time, ignoreBookingId = null }) => {
  const params = [hall_id, end_time, start_time]; // SQL-ийн parameter-ууд.
  let sql = "SELECT id FROM bookings WHERE hall_id = ? AND status IN ('PENDING', 'PAID') AND deleted_at IS NULL AND start_time < ? AND end_time > ?"; // Давхцал шалгах SQL.
  if (ignoreBookingId) {
    sql += " AND id != ?"; // Хэрэв өөр booking-ыг update хийж байвал өөрийг нь хасна.
    params.push(ignoreBookingId);
  }
  const [rows] = await pool.execute(sql, params); // Давхардсан booking байгаа эсэхийг шалгана.
  return rows.length > 0; // Яасан нэг мөр олдвол overlap байна.
};

export const getHallBookings = async (hallId, startTime, endTime) => {
  let sql = "SELECT id, start_time, end_time, status FROM bookings WHERE hall_id = ? AND deleted_at IS NULL"; // Заалын захиалгуудын query эхлэл.
  const params = [hallId];

  if (startTime && endTime) {
    sql += " AND start_time < ? AND end_time > ?"; // Тухайн цагийн давхцалтай захиалгуудыг хамгаална.
    params.push(endTime, startTime);
  }

  sql += " ORDER BY start_time"; // Эхлэх хугацаагаар эрэмбэлнэ.
  const [rows] = await pool.execute(sql, params); // Query-г ажиллуулна.
  return rows; // Захиалгуудын массивыг буцаана.
};

export const updateBooking = async (id, fields) => {
  const allowedFields = ["start_time", "end_time", "total_price", "status"]; // Update-д зөвшөөрсөн талбарууд.
  const entries = Object.entries(fields).filter(([key]) => allowedFields.includes(key)); // Зөвшөөрөгдсөн талбаруудыг шүүх.
  if (entries.length === 0) return getBookingById(id); // Хэрэв өөрчлөлт байхгүй бол одоогийн booking-г буцаана.

  const setSql = entries.map(([key]) => `${key} = ?`).join(", "); // SQL SET хэсгийг динамикаар бүрдүүлнэ.
  const values = entries.map(([, value]) => value); // Утгуудын массив.
  await pool.execute(`UPDATE bookings SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`, [...values, id]); // Booking update хийнэ.
  return getBookingById(id); // Шинэчлэгдсэн booking-г буцаана.
};

export const cancelBooking = async (id) => {
  await pool.execute("UPDATE bookings SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL", [id]); // Booking-ийг CANCELLED болгоно.
  return getBookingById(id); // Цуцлагдсан booking-г татна.
};

export const softDeleteBooking = async (id) => {
  await pool.execute("UPDATE bookings SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL", [id]); // deleted_at-ыг шинэчлэх замаар soft delete хийнэ.
  return true; // Амжилттай болсон гэдгийг буцаана.
};

export const createReview = async ({ booking_id, user_id, rating, comment }) => {
  const [result] = await pool.execute(
    "INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
    [booking_id, user_id, rating, comment]
  ); // Review-ийг шинэчилж хадгална.
  const [rows] = await pool.execute("SELECT * FROM reviews WHERE id = ?", [result.insertId]); // Шинэ review-ийг дахин татаад буцаана.
  return rows[0] || null;
};

export const getReviewsByBookingId = async (bookingId) => {
  const [rows] = await pool.execute(
    "SELECT r.*, u.name AS user_name FROM reviews r LEFT JOIN users u ON u.id = r.user_id WHERE r.booking_id = ? AND r.deleted_at IS NULL ORDER BY r.created_at DESC",
    [bookingId]
  ); // Захиалгын review-үүдийг хэрэглэгчийн нэртэйгээр татна.
  return rows; // Review массивыг буцаана.
};
