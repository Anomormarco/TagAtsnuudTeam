const express = require("express");
const asyncHandler = require("express-async-handler");
const {
  createReviewController,
  getReviewsController,
} = require("../controllers/bookingController");

const router = express.Router({ mergeParams: true });

router.post("/", asyncHandler(createReviewController));
router.get("/", asyncHandler(getReviewsController));

module.exports = router;
