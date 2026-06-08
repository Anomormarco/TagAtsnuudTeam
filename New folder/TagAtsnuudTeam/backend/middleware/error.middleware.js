// Express-ийн бүх error-ийг нэг ижил JSON response format-д оруулна.
function errorMiddleware(error, req, res, next) {
  const status = error.status || error.statusCode || 500;
  const responseStatus = status >= 400 ? status : 500;

  res.status(responseStatus).json({
    success: false,
    message: error.message || 'Server error',
    errors: error.details || null,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorMiddleware;
