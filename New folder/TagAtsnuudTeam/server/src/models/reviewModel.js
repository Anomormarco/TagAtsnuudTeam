const reviewRepository = require("../repositories/review.repository");

module.exports = {
  createReviewRecord: reviewRepository.createReview,
  getReviewByBookingAndUser: reviewRepository.getReviewByBookingAndUser,
  getReviewsByBookingId: reviewRepository.getReviewsByBookingId,
};
