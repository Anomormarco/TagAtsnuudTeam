import { sendSuccess } from "../utils/apiResponse.js"; // Амжилттай response үүсгэх helper.
import * as bookingService from "../services/booking.service.js"; // Booking service-ээс бизнес логик функцуудыг import хийнэ.

export const createBookingController = async (req, res) => {
  const booking = await bookingService.createBooking(req.body); // Захиалгыг бизнес логикээр үүсгэнэ.
  return sendSuccess(res, "Захиалга амжилттай үүслээ.", booking, 201); // 201 статус болон booking өгөгдлийг буцаана.
};

export const getMyBookingsController = async (req, res) => {
  const userId = req.user?.id || req.query.userId; // Auth байхгүй тохиолдолд query parameter-аар fallback хийнэ.
  const bookings = await bookingService.getMyBookings(userId);
  return sendSuccess(res, "Миний захиалгууд амжилттай олдлоо.", bookings);
};

export const getBookingController = async (req, res) => {
  const booking = await bookingService.getBooking(req.params.id);
  return sendSuccess(res, "Захиалгын мэдээлэл амжилттай олдлоо.", booking);
};

export const updateBookingController = async (req, res) => {
  const booking = await bookingService.updateBooking(req.params.id, req.body);
  return sendSuccess(res, "Захиалга амжилттай шинэчлэгдлээ.", booking);
};

export const cancelBookingController = async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id);
  return sendSuccess(res, "Захиалга амжилттай цуцлагдлаа.", booking);
};

export const deleteBookingController = async (req, res) => {
  await bookingService.softDeleteBooking(req.params.id);
  return sendSuccess(res, "Захиалга амжилттай устгагдлаа.", { id: req.params.id });
};

export const getHallAvailabilityController = async (req, res) => {
  const hallId = req.params.id || req.query.hall_id; // Хоёр endpoint-той нийцүүлэхийн тулд params эсвэл query-г ашиглана.
  const { start_time, end_time } = req.query;
  const availability = await bookingService.getHallAvailability(hallId, start_time, end_time);
  return sendSuccess(res, "Заалны боломжит цагийн мэдээлэл.", availability);
};

export const checkOverlapController = async (req, res) => {
  const overlaps = await bookingService.checkOverlap(req.query);
  return sendSuccess(res, overlaps ? "Цаг давхцаж байна." : "Цаг боломжтой.", {
    hall_id: Number(req.query.hall_id),
    start_time: req.query.start_time,
    end_time: req.query.end_time,
    overlaps,
  });
};

export const createReviewController = async (req, res) => {
  const bookingId = req.params.bookingId || req.params.id; // bookingId-г params-аас авна.
  const review = await bookingService.createReview({ booking_id: bookingId, ...req.body });
  return sendSuccess(res, "Review амжилттай нэмэгдлээ.", review, 201);
};

export const getReviewsController = async (req, res) => {
  const bookingId = req.params.bookingId || req.params.id; // bookingId-г params-аас авна.
  const reviews = await bookingService.getReviews(bookingId);
  return sendSuccess(res, "Booking-ын review-үүд амжилттай олдлоо.", reviews);
};
