const express = require("express");
const hallController = require("../controllers/hall.controller");
const { getHallAvailabilityController } = require("../controllers/bookingController");
const { uploadHallImage } = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", hallController.getHalls);
router.post("/", hallController.createHall);
router.post("/upload-image", uploadHallImage.single("image"), hallController.uploadHallImage);
router.get("/:id/available-times", getHallAvailabilityController);
router.get("/:id", hallController.getHallById);
router.put("/:id", hallController.updateHall);
router.patch("/:id", hallController.updateHall);
router.delete("/:id", hallController.deleteHall);

module.exports = router;


