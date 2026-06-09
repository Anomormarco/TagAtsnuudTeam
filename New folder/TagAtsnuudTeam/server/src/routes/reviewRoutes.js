import express from "express"; // Express router үүсгэхэд ашиглана.
import expressAsyncHandler from "express-async-handler"; // Async контроллеруудын алдааг next рүү дамжуулахад ашиглана.
import { createReviewController, getReviewsController } from "../controllers/bookingController.js"; // Review controller-үүдийг import хийнэ.

const router = express.Router({ mergeParams: true }); // mergeParams=True бол parent route-ийн params-г ашиглаж болно.

router.post("/", expressAsyncHandler(createReviewController)); // Booking-ийн review нэмэх POST endpoint.
router.get("/", expressAsyncHandler(getReviewsController)); // Booking-ийн review-үүдийг авах GET endpoint.

export default router; // Router-ийг экспортлож server-д ашиглана.
