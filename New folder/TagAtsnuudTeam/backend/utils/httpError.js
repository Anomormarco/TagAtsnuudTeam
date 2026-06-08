// Controller/service дээр status code-той Error үүсгэх жижиг helper.
function createHttpError(status, message, details = null) {
  const error = new Error(message);
  error.status = status;

  if (details) {
    error.details = details;
  }

  return error;
}

module.exports = createHttpError;
