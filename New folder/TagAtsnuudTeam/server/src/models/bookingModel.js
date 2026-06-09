const bookingRepository = require("../repositories/booking.repository");
const reviewRepository = require("../repositories/review.repository");

const bookingStatuses = ["PENDING", "PAID", "CANCELLED", "COMPLETED"];

module.exports = {
  bookingStatuses,
  cancelBooking: bookingRepository.cancelBooking,
  createBooking: bookingRepository.createBooking,
  createReview: reviewRepository.createReview,
  getBookingById: bookingRepository.getBookingById,
  getBookingsByUserId: bookingRepository.getBookingsByUserId,
  getHallBookings: bookingRepository.getHallBookings,
  getReviewsByBookingId: reviewRepository.getReviewsByBookingId,
  hasOverlappingBooking: bookingRepository.hasOverlappingBooking,
  softDeleteBooking: bookingRepository.softDeleteBooking,
  updateBooking: bookingRepository.updateBooking,
};
