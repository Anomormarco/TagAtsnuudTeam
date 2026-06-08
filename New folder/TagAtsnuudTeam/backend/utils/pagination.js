// Query string-ээс page/size уншаад SQL-д хэрэглэх limit/offset болгож өгнө.
function parsePagination(query = {}) {
  const page = Math.max(Number(query.page || 1), 1);
  const size = Math.min(Math.max(Number(query.size || 10), 1), 100);
  const offset = (page - 1) * size;

  return { page, size, limit: size, offset };
}

// Pagination response-ийн нийтлэг хэлбэр.
function paginatedResponse(content, totalElements, page, size) {
  return {
    content,
    page,
    size,
    totalElements,
    totalPages: Math.ceil(Number(totalElements || 0) / size)
  };
}

module.exports = {
  paginatedResponse,
  parsePagination
};
