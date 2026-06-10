const asyncHandler = require("../utils/asyncHandler");
const hallService = require("../services/hall.service");
const { sendSuccess } = require("../utils/response");

const getRequestUser = (req) => ({
  id: req.user?.userId || req.user?.id,
  role: req.user?.role,
});

const getHalls = asyncHandler(async (req, res) => {
  const halls = await hallService.getHalls({
    keyword: req.query.keyword,
    category: req.query.category,
    location: req.query.location,
    page: req.query.page,
    size: req.query.size,
    sort: req.query.sort,
    ownerId: req.query.ownerId || req.query.owner_id,
  });
  sendSuccess(res, halls, "Заалны жагсаалт амжилттай");
});





const getHallById = asyncHandler(async (req, res) => {
  const hall = await hallService.getHallById(req.params.id);
  sendSuccess(res, hall, "Заалны дэлгэрэнгүй амжилттай");
});

const uploadHallImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error("Зураг файл оруулна уу");
    error.statusCode = 400;
    throw error;
  }

  sendSuccess(
    res,
    {
      imageUrl: `/uploads/halls/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
    "Заалны зураг амжилттай upload хийгдлээ",
    201
  );
});

const createHall = asyncHandler(async (req, res) => {
  const hall = await hallService.createHall(req.body, getRequestUser(req));
  sendSuccess(res, hall, "Заал амжилттай үүслээ", 201);
});

const updateHall = asyncHandler(async (req, res) => {
  const hall = await hallService.updateHall(req.params.id, req.body, getRequestUser(req));
  sendSuccess(res, hall, "Заал амжилттай шинэчлэгдлээ");
});

const deleteHall = asyncHandler(async (req, res) => {
  const result = await hallService.deleteHall(req.params.id, getRequestUser(req));
  sendSuccess(res, result, "Заал амжилттай устгагдлаа");
});

module.exports = {
  getHalls,
  getHallById,
  uploadHallImage,
  createHall,
  updateHall,
  deleteHall,
};





