const { sendError } = require("../utils/response");

const notFound = (req, res, next) => {
  const error = new Error(`${req.originalUrl} route олдсонгүй`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 && process.env.NODE_ENV !== "test" ? "Серверийн алдаа гарлаа" : err.message;

  sendError(res, statusCode, message, err.errors || null);
};

module.exports = {
  notFound,
  errorHandler,
};
