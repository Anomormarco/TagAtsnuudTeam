const sendSuccess = (res, data = null, message = "Амжилттай", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (res, statusCode = 500, message = "Алдаа гарлаа", errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  sendSuccess,
  sendError,
};



