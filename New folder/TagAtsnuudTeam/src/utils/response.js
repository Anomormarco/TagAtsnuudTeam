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
