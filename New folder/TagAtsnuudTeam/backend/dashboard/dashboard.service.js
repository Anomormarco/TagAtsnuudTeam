const dashboardRepository = require('./dashboard.repository');
const cache = require('../utils/cache');

module.exports = {
  // Dashboard query олон aggregate ажиллуулдаг тул богино хугацаанд cache-лэнэ.
  getAdminDashboard: async () => cache.remember(
    'dashboard:admin',
    undefined,
    dashboardRepository.getAdminDashboard
  ),
  // Owner бүр өөр cache key-тэй, нэг owner-ийн data нөгөөд холилдохгүй.
  getOwnerDashboard: async (ownerId) => cache.remember(
    `dashboard:owner:${ownerId}`,
    undefined,
    () => dashboardRepository.getOwnerDashboard(ownerId)
  )
};
