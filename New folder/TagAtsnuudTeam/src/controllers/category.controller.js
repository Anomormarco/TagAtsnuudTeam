const asyncHandler = require("../utils/asyncHandler");
const categoryService = require("../services/category.service");
const { sendSuccess } = require("../utils/response");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories();
  sendSuccess(res, categories, "Ангиллын жагсаалт амжилттай");
});

module.exports = {
  getCategories,
};


