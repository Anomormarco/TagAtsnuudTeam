const fs = require("fs");
const path = require("path");
const ApiError = require("../utils/apiError");

let multer;

try {
  multer = require("multer");
} catch (error) {
  multer = null;
}

const hallUploadDir = path.join(process.cwd(), "uploads", "halls");
const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

if (!fs.existsSync(hallUploadDir)) {
  fs.mkdirSync(hallUploadDir, { recursive: true });
}

const createMissingMulterMiddleware = () => ({
  single: () => (req, res, next) => {
    next(new ApiError(503, "multer package суулгагдаагүй байна. npm install multer ажиллуулна уу"));
  },
});

if (!multer) {
  module.exports = {
    uploadHallImage: createMissingMulterMiddleware(),
  };
  return;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, hallUploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `hall-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  },
});

const imageFileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  if (!allowedImageTypes.includes(file.mimetype) || !allowedExtensions.includes(extension)) {
    return cb(new ApiError(400, "Зөвхөн jpg, jpeg, png, webp зураг оруулна уу"));
  }

  return cb(null, true);
};

const uploadHallImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  uploadHallImage,
};
