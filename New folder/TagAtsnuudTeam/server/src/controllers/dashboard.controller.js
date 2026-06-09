const asyncHandler = require('express-async-handler');
const dashboardService = require('./dashboard.service');
const createHttpError = require('../utils/httpError');

const getAdminDashboard = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getAdminDashboard());
});

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
