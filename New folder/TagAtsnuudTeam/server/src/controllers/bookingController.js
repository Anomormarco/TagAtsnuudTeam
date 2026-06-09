const bookingService = require("../services/booking.service");
const { sendSuccess } = require("../utils/response");

const createBookingController = async (req, res) => {
  const booking = await bookingService.createBooking(req.body);
  return sendSuccess(res, booking, "Booking created successfully", 201);
};

const getMyBookingsController = async (req, res) => {
  const userId = req.user?.id || req.query.userId || req.headers["x-user-id"];
  const bookings = await bookingService.getMyBookings(userId);
  return sendSuccess(res, bookings, "My bookings fetched successfully");
};

const getBookingController = async (req, res) => {
  const booking = await bookingService.getBooking(req.params.id);
  return sendSuccess(res, booking, "Booking fetched successfully");
};

const updateBookingController = async (req, res) => {
  const booking = await bookingService.updateBooking(req.params.id, req.body);
  return sendSuccess(res, booking, "Booking updated successfully");
};

const cancelBookingController = async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id);
  return sendSuccess(res, booking, "Booking cancelled successfully");
};

const deleteBookingController = async (req, res) => {
  await bookingService.softDeleteBooking(req.params.id);
  return sendSuccess(res, { id: req.params.id }, "Booking deleted successfully");
};

const getHallAvailabilityController = async (req, res) => {
  const hallId = req.params.id || req.query.hall_id;
  const { start_time, end_time } = req.query;
  const availability = await bookingService.getHallAvailability(hallId, start_time, end_time);
  return sendSuccess(res, availability, "Hall availability fetched successfully");
};

const checkOverlapController = async (req, res) => {
  const overlaps = await bookingService.checkOverlap(req.query);
  return sendSuccess(res, {
    hall_id: Number(req.query.hall_id),
    start_time: req.query.start_time,
    end_time: req.query.end_time,
    overlaps,
  }, overlaps ? "Time overlaps" : "Time is available");
};

const createReviewController = async (req, res) => {
  const hallId = req.params.hallId || req.params.id;
  const userId = req.user?.id || req.body.user_id || req.headers["x-user-id"];
  const review = await bookingService.createReview({ hall_id: hallId, ...req.body, user_id: userId });
  return sendSuccess(res, review, "Review created successfully", 201);
};

const getReviewsController = async (req, res) => {
  const hallId = req.params.hallId || req.params.id;
  const reviews = await bookingService.getReviews(hallId);
  return sendSuccess(res, reviews, "Reviews fetched successfully");
};

module.exports = {
  cancelBookingController,
  checkOverlapController,
  createBookingController,
  createReviewController,
  deleteBookingController,
  getBookingController,
  getHallAvailabilityController,
  getMyBookingsController,
  getReviewsController,
  updateBookingController,
};
