import * as bookingRepository from "../repositories/booking.repository.js";
import * as reviewRepository from "../repositories/review.repository.js";
import { ApiError } from "../utils/ApiError.js";

const CACHE_TTL_MS = 15000; // Available time cache-ийн хугацаа, миллисекундээр.
const availableTimeCache = new Map(); // In-memory cache.

export const calculateTotalPrice = (pricePerHour, startTime, endTime) => {
  const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  if (durationMs <= 0) {
    throw new ApiError(400, "Start_time болон end_time хоорондын интервал 0-ээс их байх ёстой.");
  }

  const hours = durationMs / 1000 / 60 / 60; // Цагийн хугацаа бутархайгаар.
  return Number((hours * Number(pricePerHour)).toFixed(2)); // 2 оронтой багадаа формат.
};

export const isValidDateRange = (startTime, endTime) => {
  return new Date(startTime).getTime() < new Date(endTime).getTime();
};

const getCacheKey = (hallId) => `hall_${hallId}`; // Cache түлхүүр үүсгэх.

const clearHallCache = (hallId) => {
  availableTimeCache.delete(getCacheKey(hallId)); // Хүснэгтээс тухайн заалын cache-ийг арилгана.
};

export const createBooking = async ({ user_id, hall_id, start_time, end_time }) => {
  if (!user_id || !hall_id || !start_time || !end_time) {
    throw new ApiError(400, "user_id, hall_id, start_time, end_time бүгд шаардлагатай.");
  }
  if (!isValidDateRange(start_time, end_time)) {
    throw new ApiError(400, "Эхлэх цаг дуусах цагаас өмнө байх ёстой.");
  }

  const hall = await bookingRepository.getHallById(hall_id);
  if (!hall) {
    throw new ApiError(404, "Заал олдсонгүй.");
  }
  if (hall.status !== "ACTIVE") {
    throw new ApiError(400, "Энэ заал одоогоор захиалга авах боломжгүй.");
  }

  const overlaps = await bookingRepository.hasOverlappingBooking({ hall_id, start_time, end_time });
  if (overlaps) {
    throw new ApiError(409, "Энэ цаг дээр захиалга давхцаж байна.");
  }

  const total_price = calculateTotalPrice(hall.price_per_hour, start_time, end_time);
  const booking = await bookingRepository.createBooking({ user_id, hall_id, start_time, end_time, total_price });
  clearHallCache(hall_id); // Шинэ booking үүссэн тул cache-ийг арилгана.
  return booking;
};

export const getMyBookings = async (userId) => {
  if (!userId) {
    throw new ApiError(400, "userId шаардлагатай.");
  }
  return bookingRepository.getBookingsByUserId(userId);
};

export const getBooking = async (id) => {
  const booking = await bookingRepository.getBookingById(id);
  if (!booking) {
    throw new ApiError(404, "Захиалга олдсонгүй.");
  }
  return booking;
};

export const updateBooking = async (id, updates) => {
  const booking = await bookingRepository.getBookingById(id);
  if (!booking) {
    throw new ApiError(404, "Захиалга олдсонгүй.");
  }

  if (updates.status && !["PENDING", "PAID", "CANCELLED", "COMPLETED"].includes(updates.status)) {
    throw new ApiError(400, "Захиалгын статус буруу байна.");
  }

  const start_time = updates.start_time || booking.start_time;
  const end_time = updates.end_time || booking.end_time;
  if (!isValidDateRange(start_time, end_time)) {
    throw new ApiError(400, "Эхлэх цаг дуусах цагаас өмнө байх ёстой.");
  }

  const overlaps = await bookingRepository.hasOverlappingBooking({
    hall_id: booking.hall_id,
    start_time,
    end_time,
    ignoreBookingId: id,
  });

  if (overlaps) {
    throw new ApiError(409, "Энэ цаг дээр захиалга давхцаж байна.");
  }

  const hall = await bookingRepository.getHallById(booking.hall_id);
  const total_price = calculateTotalPrice(hall.price_per_hour, start_time, end_time);
  const updatedBooking = await bookingRepository.updateBooking(id, { ...updates, total_price });
  clearHallCache(booking.hall_id); // Үйлдэл хийсэн тохиолдолд cache-ийг цэвэрлэнэ.
  return updatedBooking;
};

export const cancelBooking = async (id) => {
  const booking = await bookingRepository.getBookingById(id);
  if (!booking) {
    throw new ApiError(404, "Захиалга олдсонгүй.");
  }
  const cancelled = await bookingRepository.cancelBooking(id);
  clearHallCache(booking.hall_id); // Cancel хийсэн үед cache-ийг арилгана.
  return cancelled;
};

export const softDeleteBooking = async (id) => {
  const booking = await bookingRepository.getBookingById(id);
  if (!booking) {
    throw new ApiError(404, "Захиалга олдсонгүй.");
  }
  await bookingRepository.softDeleteBooking(id);
  clearHallCache(booking.hall_id); // Soft delete хийсэн үед cache-ийг цэвэрлэнэ.
  return true;
};

export const getHallAvailability = async (hallId, startTime, endTime) => {
  if (!hallId) {
    throw new ApiError(400, "hall_id шаардлагатай.");
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

export const checkOverlap = async ({ hall_id, start_time, end_time, ignoreBookingId }) => {
  if (!hall_id || !start_time || !end_time) {
    throw new ApiError(400, "hall_id, start_time болон end_time шаардлагатай.");
  }
  if (!isValidDateRange(start_time, end_time)) {
    throw new ApiError(400, "Эхлэх цаг дуусах цагаас өмнө байх ёстой.");
  }
  const overlaps = await bookingRepository.hasOverlappingBooking({ hall_id, start_time, end_time, ignoreBookingId });
  return overlaps;
};

export const createReview = async ({ booking_id, user_id, rating, comment }) => {
  if (!booking_id || !user_id || rating == null || !comment) {
    throw new ApiError(400, "booking_id, user_id, rating, comment бүгд шаардлагатай.");
  }
  if (Number(rating) < 1 || Number(rating) > 5) {
    throw new ApiError(400, "rating нь 1-5 хооронд байх ёстой.");
  }

  const booking = await bookingRepository.getBookingById(booking_id);
  if (!booking) {
    throw new ApiError(404, "Захиалга олдсонгүй.");
  }
  if (booking.user_id !== Number(user_id)) {
    throw new ApiError(403, "Зөвхөн тухайн booking хийсэн хэрэглэгч review бичиж болно.");
  }

  const existing = await reviewRepository.getReviewByBookingAndUser(booking_id, user_id);
  if (existing) {
    throw new ApiError(409, "Та энэ захиалгын талаар аль хэдийн review бичсэн байна.");
  }

  return reviewRepository.createReview({ booking_id, user_id, rating, comment });
};

export const getReviews = async (bookingId) => {
  if (!bookingId) {
    throw new ApiError(400, "bookingId шаардлагатай.");
  }
  return reviewRepository.getReviewsByBookingId(bookingId);
};
