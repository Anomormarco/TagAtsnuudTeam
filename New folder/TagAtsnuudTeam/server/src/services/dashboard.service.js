const dashboardRepository = require('./dashboard.repository');
const cache = require('../utils/cache');

module.exports = {
  getAdminDashboard: async () => cache.remember(
    'dashboard:admin',
    undefined,
    dashboardRepository.getAdminDashboard
  ),
  getOwnerDashboard: async (ownerId) => cache.remember(
    `dashboard:owner:${ownerId}`,
    undefined,
    () => dashboardRepository.getOwnerDashboard(ownerId)
  )
};
