import express from "express"; // Express router үүсгэхэд ашиглана.
import expressAsyncHandler from "express-async-handler"; // Async контроллеруудын алдааг next рүү дамжуулахад ашиглана.
import {
  cancelBookingController,
  checkOverlapController,
  createBookingController,
  deleteBookingController,
  getBookingController,
  getHallAvailabilityController,
  getMyBookingsController,
  updateBookingController,
} from "../controllers/bookingController.js"; // Бүх booking controller-үүдийг import хийнэ.

const router = express.Router(); // Booking module-д зориулсан router instance.

router.post("/", expressAsyncHandler(createBookingController)); // Шинэ booking үүсгэх POST endpoint.
router.get("/my", expressAsyncHandler(getMyBookingsController)); // Тухайн хэрэглэгчийн booking жагсаалт авах GET endpoint.
router.get("/availability", expressAsyncHandler(getHallAvailabilityController)); // Заалны боломжит цаг шалгах GET endpoint.
router.get("/check-overlap", expressAsyncHandler(checkOverlapController)); // Давхардлыг шалгах GET endpoint.
router.get("/:id", expressAsyncHandler(getBookingController)); // Тухайн booking дэлгэрэнгүй авах GET endpoint.
router.patch("/:id", expressAsyncHandler(updateBookingController)); // Booking мэдээлэл шинэчлэх PATCH endpoint.
router.patch("/:id/cancel", expressAsyncHandler(cancelBookingController)); // Booking-ийг цуцлах PATCH endpoint.
router.delete("/:id", expressAsyncHandler(deleteBookingController)); // Booking-г soft delete хийх DELETE endpoint.

export default router; // Энэ router-ийг сервер рүү экспортлана.
