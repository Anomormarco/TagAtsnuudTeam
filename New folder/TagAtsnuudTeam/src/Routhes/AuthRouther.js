const express = require('express');
const router = express.Router();
const authController = require('../Controllers/AuthController');
const authMiddleware = require('../Middleware/authMiddleware');

/**
 * Auth Routes
 * Prefix: /api/v1/auth
 */

/**
 * @route POST /api/v1/auth/register
 * @description Register new user
 * @access Public
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @route POST /api/v1/auth/login
 * @description Login user
 * @access Public
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @route POST /api/v1/auth/logout
 * @description Logout user
 * @access Private
 */
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

/**
 * @route POST /api/v1/auth/refresh-token
 * @description Refresh access token
 * @access Public
 */
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));

/**
 * @route GET /api/v1/auth/me
 * @description Get current user profile
 * @access Private
 */
router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

module.exports = router;
