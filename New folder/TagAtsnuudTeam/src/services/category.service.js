const categoryRepository = require("../repositories/category.repository");
const cache = require("../utils/cache");

const getCategories = async () => {
  const cacheKey = "categories:list";
  const cachedCategories = cache.get(cacheKey);

  if (cachedCategories) {
    return cachedCategories;
  }

  const categories = await categoryRepository.findAll();
  cache.set(cacheKey, categories);
  return categories;
};

module.exports = {
  getCategories,
};
