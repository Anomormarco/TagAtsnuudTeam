const bookingRepository = require("../repositories/booking.repository");
const reviewRepository = require("../repositories/review.repository");
const ApiError = require("../utils/apiError");

const CACHE_TTL_MS = 15000;
const availableTimeCache = new Map();

const calculateTotalPrice = (pricePerHour, startTime, endTime) => {
  const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  if (durationMs <= 0) {
    throw new ApiError(400, "start_time and end_time must be a valid range");
  }

  const hours = durationMs / 1000 / 60 / 60;
  return Number((hours * Number(pricePerHour)).toFixed(2));
};

const isValidDateRange = (startTime, endTime) => new Date(startTime).getTime() < new Date(endTime).getTime();

const getCacheKey = (hallId) => `hall_${hallId}`;

const clearHallCache = (hallId) => {
  availableTimeCache.delete(getCacheKey(hallId));
};

const createBooking = async ({ user_id, hall_id, start_time, end_time }) => {
  if (!user_id || !hall_id || !start_time || !end_time) {
    throw new ApiError(400, "user_id, hall_id, start_time, end_time are required");
  }
  if (!isValidDateRange(start_time, end_time)) {
    throw new ApiError(400, "start_time must be before end_time");
  }

  const hall = await bookingRepository.getHallById(hall_id);
  if (!hall) {
    throw new ApiError(404, "Hall not found");
  }
  if (hall.status && !["ACTIVE", "AVAILABLE"].includes(hall.status)) {
    throw new ApiError(400, "Hall is not available for booking");
  }

  const overlaps = await bookingRepository.hasOverlappingBooking({ hall_id, start_time, end_time });
  if (overlaps) {
    throw new ApiError(409, "Booking time overlaps with another booking");
  }

  const total_price = calculateTotalPrice(hall.price_per_hour, start_time, end_time);
  const booking = await bookingRepository.createBooking({ user_id, hall_id, start_time, end_time, total_price });
  clearHallCache(hall_id);
  return booking;
};

const getMyBookings = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }
  return bookingRepository.getBookingsByUserId(userId);
};

const getBooking = async (id) => {
  const booking = await bookingRepository.getBookingById(id);
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  return booking;
};

const updateBooking = async (id, updates) => {
  const booking = await getBooking(id);

  if (updates.status && !["PENDING", "PAID", "CANCELLED", "COMPLETED"].includes(updates.status)) {
    throw new ApiError(400, "Invalid booking status");
  }

  const start_time = updates.start_time || booking.start_time;
  const end_time = updates.end_time || booking.end_time;
  if (!isValidDateRange(start_time, end_time)) {
    throw new ApiError(400, "start_time must be before end_time");
  }

  const overlaps = await bookingRepository.hasOverlappingBooking({
    hall_id: booking.hall_id,
    start_time,
    end_time,
    ignoreBookingId: id,
  });

  if (overlaps) {
    throw new ApiError(409, "Booking time overlaps with another booking");
  }

  const hall = await bookingRepository.getHallById(booking.hall_id);
  const total_price = calculateTotalPrice(hall.price_per_hour, start_time, end_time);
  const updatedBooking = await bookingRepository.updateBooking(id, { ...updates, total_price });
  clearHallCache(booking.hall_id);
  return updatedBooking;
};

const cancelBooking = async (id) => {
  const booking = await getBooking(id);
  const cancelled = await bookingRepository.cancelBooking(id);
  clearHallCache(booking.hall_id);
  return cancelled;
};

const softDeleteBooking = async (id) => {
  const booking = await getBooking(id);
  await bookingRepository.softDeleteBooking(id);
  clearHallCache(booking.hall_id);
  return true;
};

const getHallAvailability = async (hallId, startTime, endTime) => {
  if (!hallId) {
    throw new ApiError(400, "hall_id is required");
  }

  const cacheKey = getCacheKey(hallId);
  const cached = availableTimeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      hall_id: Number(hallId),
      start_time: startTime || null,
      end_time: endTime || null,
      bookings: cached.bookings,
      available: startTime && endTime ? !cached.bookings.some((booking) => booking.start_time < endTime && booking.end_time > startTime) : true,
      cache: true,
    };
  }

  const bookings = await bookingRepository.getHallBookings(hallId, startTime, endTime);
  availableTimeCache.set(cacheKey, { bookings, expiresAt: Date.now() + CACHE_TTL_MS });

  const available = !startTime || !endTime ? true : !(await bookingRepository.hasOverlappingBooking({ hall_id: hallId, start_time: startTime, end_time: endTime }));
  return {
    hall_id: Number(hallId),
    start_time: startTime || null,
    end_time: endTime || null,
    bookings,
    available,
    cache: false,
  };
};

const checkOverlap = async ({ hall_id, start_time, end_time, ignoreBookingId }) => {
  if (!hall_id || !start_time || !end_time) {
    throw new ApiError(400, "hall_id, start_time and end_time are required");
  }
  if (!isValidDateRange(start_time, end_time)) {
    throw new ApiError(400, "start_time must be before end_time");
  }
  return bookingRepository.hasOverlappingBooking({ hall_id, start_time, end_time, ignoreBookingId });
};

const createReview = async ({ hall_id, user_id, rating, comment }) => {
  if (!hall_id || !user_id || rating == null) {
    throw new ApiError(400, "hall_id, user_id and rating are required");
  }
  if (Number(rating) < 1 || Number(rating) > 5) {
    throw new ApiError(400, "rating must be between 1 and 5");
  }

  const hall = await bookingRepository.getHallById(hall_id);
  if (!hall) {
    throw new ApiError(404, "Hall not found");
  }

  const existing = await reviewRepository.getReviewByHallAndUser(hall_id, user_id);
  if (existing) {
    throw new ApiError(409, "Review already exists for this hall");
  }

  return reviewRepository.createReview({ hall_id, user_id, rating, comment });
};

const getReviews = async (hallId) => {
  if (!hallId) {
    throw new ApiError(400, "hallId is required");
  }
  return reviewRepository.getReviewsByHallId(hallId);
};

module.exports = {
  calculateTotalPrice,
  cancelBooking,
  checkOverlap,
  createBooking,
  createReview,
  getBooking,
  getHallAvailability,
  getMyBookings,
  getReviews,
  isValidDateRange,
  softDeleteBooking,
  updateBooking,
};
