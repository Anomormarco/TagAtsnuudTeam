// Амжилттай response-ийн стандарт wrapper.
function success(res, data, message = 'Success', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
    errors: null,
    timestamp: new Date().toISOString()
  });
}

// Алдаатай response-ийн стандарт wrapper.
function error(res, message, status = 500, errors = null) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  error,
  success
};
