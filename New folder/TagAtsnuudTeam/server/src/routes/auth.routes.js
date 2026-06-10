const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const rbacMiddleware = require("../middleware/rbac.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.get("/admin-exists", authController.getAdminExists);
router.get("/me", authMiddleware, authController.getMe);
router.get("/owners", authMiddleware, rbacMiddleware(["ADMIN"]), authController.getOwners);
router.post("/owners", authMiddleware, rbacMiddleware(["ADMIN"]), authController.createOwner);

module.exports = router;
