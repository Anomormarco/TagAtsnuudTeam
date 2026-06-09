import express from "express"; // Express router үүсгэхэд ашиглана.
import expressAsyncHandler from "express-async-handler"; // Async контроллеруудын алдааг next рүү дамжуулахад ашиглана.
import { getHallAvailabilityController } from "../controllers/bookingController.js"; // Hall availability controller-ийг import хийнэ.

const router = express.Router(); // Hall module-д зориулсан router instance.

router.get("/:id/available-time", expressAsyncHandler(getHallAvailabilityController)); // Заалны боломжит цагийг авах GET endpoint.

export default router; // Router-ийг экспортлож server-д ашиглана.
