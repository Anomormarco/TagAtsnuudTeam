const pool = require("../config/db");

const getBookingById = async (id) => {
  const [rows] = await pool.execute(
    "SELECT b.*, h.name AS hall_name, h.location AS hall_location, h.price_per_hour FROM bookings b LEFT JOIN halls h ON h.id = b.hall_id WHERE b.id = ? AND b.deleted_at IS NULL",
    [id]
  );
  return rows[0] || null;
};

const getBookingsByUserId = async (userId) => {
  const [rows] = await pool.execute(
    "SELECT b.*, h.name AS hall_name, h.location AS hall_location FROM bookings b LEFT JOIN halls h ON h.id = b.hall_id WHERE b.user_id = ? AND b.deleted_at IS NULL ORDER BY b.start_time DESC",
    [userId]
  );
  return rows;
};

const getHallById = async (hallId) => {
  const [rows] = await pool.execute("SELECT * FROM halls WHERE id = ? AND deleted_at IS NULL", [hallId]);
  return rows[0] || null;
};

const getHallBookings = async (hallId, startTime, endTime) => {
  let sql = "SELECT id, start_time, end_time, status FROM bookings WHERE hall_id = ? AND deleted_at IS NULL";
  const params = [hallId];

  if (startTime && endTime) {
    sql += " AND start_time < ? AND end_time > ?";
    params.push(endTime, startTime);
  }

  sql += " ORDER BY start_time";
  const [rows] = await pool.execute(sql, params);
  return rows;
};

const hasOverlappingBooking = async ({ hall_id, start_time, end_time, ignoreBookingId = null }) => {
  const params = [hall_id, end_time, start_time];
  let sql = "SELECT id FROM bookings WHERE hall_id = ? AND status IN ('PENDING', 'PAID') AND deleted_at IS NULL AND start_time < ? AND end_time > ?";
  if (ignoreBookingId) {
    sql += " AND id != ?";
    params.push(ignoreBookingId);
  }
  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
};

const createBooking = async ({ user_id, hall_id, start_time, end_time, total_price }) => {
  const [maxRows] = await pool.execute("SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM bookings");
  const nextId = maxRows[0].nextId;

  const [result] = await pool.execute(
    "INSERT INTO bookings (id, user_id, hall_id, start_time, end_time, total_price, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')",
    [nextId, user_id, hall_id, start_time, end_time, total_price]
  );
  return getBookingById(result.insertId || nextId);
};

const updateBooking = async (id, fields) => {
  const allowedFields = ["start_time", "end_time", "total_price", "status"];
  const entries = Object.entries(fields).filter(([key]) => allowedFields.includes(key));
  if (entries.length === 0) return getBookingById(id);

  const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
  const values = entries.map(([, value]) => value);

  await pool.execute(`UPDATE bookings SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`, [...values, id]);
  return getBookingById(id);
};

const cancelBooking = async (id) => {
  await pool.execute("UPDATE bookings SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL", [id]);
  return getBookingById(id);
};

const softDeleteBooking = async (id) => {
  await pool.execute("UPDATE bookings SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL", [id]);
  return true;
};

module.exports = {
  cancelBooking,
  createBooking,
  getBookingById,
  getBookingsByUserId,
  getHallBookings,
  getHallById,
  hasOverlappingBooking,
  softDeleteBooking,
  updateBooking,
};
