const express = require("express");
const asyncHandler = require("express-async-handler");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.post("/", asyncHandler(bookingController.createBookingController));
router.get("/my", asyncHandler(bookingController.getMyBookingsController));
router.get("/availability", asyncHandler(bookingController.getHallAvailabilityController));
router.get("/check-overlap", asyncHandler(bookingController.checkOverlapController));
router.get("/:id", asyncHandler(bookingController.getBookingController));
router.patch("/:id", asyncHandler(bookingController.updateBookingController));
router.patch("/:id/cancel", asyncHandler(bookingController.cancelBookingController));
router.delete("/:id", asyncHandler(bookingController.deleteBookingController));

module.exports = router;
