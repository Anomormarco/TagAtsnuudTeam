const express = require('express');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

// /api/v1/dashboard/admin - admin dashboard-ийн aggregate data.
router.get('/admin', dashboardController.getAdminDashboard);
// /api/v1/dashboard/owner/:ownerId - тухайн owner-ийн dashboard data.
router.get('/owner/:ownerId', dashboardController.getOwnerDashboard);

module.exports = router;
