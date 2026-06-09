<<<<<<< HEAD
/**
 * Standardized response formatter
 */
class Response {
  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'Error', statusCode = 400, data = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data
    });
  }

  static paginated(res, message = 'Success', data, pagination, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination
    });
  }
}

module.exports = Response;
=======
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
>>>>>>> cf86bee4d3d7bad7b8b9eeee66dba0a4cdfc464c
