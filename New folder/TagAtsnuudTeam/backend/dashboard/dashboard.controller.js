const asyncHandler = require('express-async-handler');
const dashboardService = require('./dashboard.service');
const createHttpError = require('../utils/httpError');

// Admin-д бүх payment болон payout-ийн нэгтгэсэн dashboard статистик өгнө.
const getAdminDashboard = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getAdminDashboard());
});

// Owner dashboard нь ownerId заавал авна, ингэснээр зөв эзэмшигчийн data-г шүүнэ.
const getOwnerDashboard = asyncHandler(async (req, res) => {
  if (!req.params.ownerId) {
    throw createHttpError(400, 'ownerId is required');
  }

  res.json(await dashboardService.getOwnerDashboard(req.params.ownerId));
});

module.exports = {
  getAdminDashboard,
  getOwnerDashboard
};
