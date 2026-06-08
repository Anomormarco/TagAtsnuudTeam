import * as reviewModel from "../models/reviewModel.js"; // Review-ийн raw DB модель функцуудыг import хийж ашиглана.

export const createReview = reviewModel.createReviewRecord; // Review үүсгэх.
export const getReviewsByBookingId = reviewModel.getReviewsByBookingId; // Тухайн booking-ийн review-үүдийг татах.
export const getReviewByBookingAndUser = reviewModel.getReviewByBookingAndUser; // Хэрэглэгчийн review-ийг шалгах.
