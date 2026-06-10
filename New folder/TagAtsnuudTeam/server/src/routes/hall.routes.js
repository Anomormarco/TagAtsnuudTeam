const express = require("express");
const hallController = require("../controllers/hall.controller");
const { getHallAvailabilityController } = require("../controllers/bookingController");
const { uploadHallImage } = require("../middleware/upload.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const rbacMiddleware = require("../middleware/rbac.middleware");

const router = express.Router();
const ownerOrAdmin = [authMiddleware, rbacMiddleware(["OWNER", "ADMIN"])];

router.get("/", hallController.getHalls);
router.post("/", ownerOrAdmin, hallController.createHall);
router.post("/upload-image", ownerOrAdmin, uploadHallImage.single("image"), hallController.uploadHallImage);
router.get("/:id/available-times", getHallAvailabilityController);
router.get("/:id", hallController.getHallById);
router.put("/:id", ownerOrAdmin, hallController.updateHall);
router.patch("/:id", ownerOrAdmin, hallController.updateHall);
router.delete("/:id", ownerOrAdmin, hallController.deleteHall);

module.exports = router;

