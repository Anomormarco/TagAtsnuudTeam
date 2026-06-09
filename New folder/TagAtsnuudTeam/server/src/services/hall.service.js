const hallRepository = require("../repositories/hall.repository");
const cache = require("../utils/cache");
const ApiError = require("../utils/apiError");

const normalizeFilters = (filters = {}) => ({
  keyword: filters.keyword || "",
  category: filters.category || "",
  location: filters.location || "",
  page: Number(filters.page) || 1,
  size: Number(filters.size) || 12,
  sort: filters.sort || "created_at,desc",
});

const getHalls = async (filters = {}) => {
  const normalizedFilters = normalizeFilters(filters);
  const cacheKey = `halls:list:${JSON.stringify(normalizedFilters)}`;
  const cachedHalls = cache.get(cacheKey);

  if (cachedHalls) {
    return cachedHalls;
  }

  const halls = await hallRepository.findAll(normalizedFilters);
  cache.set(cacheKey, halls);
  return halls;
};

const getHallById = async (id) => {
  const hall = await hallRepository.findById(id);

  if (!hall) {
    throw new ApiError(404, "Заал олдсонгүй");
  }

  return hall;
};

const clearHallCache = (id) => {
  cache.clearByPrefix("halls:list:");
  cache.clearByPrefix(`halls:detail:${id}`);
};

const ensureOwnerCanModify = (hall, user = {}) => {
  if (user.role === "ADMIN") {
    return;
  }

  if (!user.id || Number(user.id) !== Number(hall.ownerId)) {
    throw new ApiError(403, "Зөвхөн өөрийн заалыг засах эрхтэй");
  }
};

const createHall = async (hallData, user = {}) => {
  const ownerId = hallData.ownerId || user.id;

  if (!ownerId) {
    throw new ApiError(400, "ownerId шаардлагатай");
  }

  const hall = await hallRepository.create({ ...hallData, ownerId });
  clearHallCache(hall.id);
  return hall;
};

const updateHall = async (id, hallData, user = {}) => {
  const hall = await getHallById(id);
  ensureOwnerCanModify(hall, user);

  const updatedHall = await hallRepository.updateById(id, hallData);
  clearHallCache(id);
  return updatedHall;
};

const deleteHall = async (id, user = {}) => {
  const hall = await getHallById(id);
  ensureOwnerCanModify(hall, user);

  const deleted = await hallRepository.softDeleteById(id);

  if (!deleted) {
    throw new ApiError(404, "Заал олдсонгүй");
  }

  clearHallCache(id);
  return { id: Number(id), deleted: true };
};

module.exports = {
  getHalls,
  getHallById,
  createHall,
  updateHall,
  deleteHall,
};
