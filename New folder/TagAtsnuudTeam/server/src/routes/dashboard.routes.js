const express = require('express');
const dashboardController = require('./dashboard.controller');

const router = express.Router();

router.get('/admin', dashboardController.getAdminDashboard);
router.get('/owner/:ownerId', dashboardController.getOwnerDashboard);

module.exports = router;
