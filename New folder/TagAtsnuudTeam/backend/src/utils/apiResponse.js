export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true, // Амжилттай хүсэлтийг тэмдэглэх boolean.
    message, // Хэрэглэгчид харуулах текстийн мэдээлэл.
    data, // API-гаас илгээх өгөгдлийг багтаана.
    errors: null, // Амжилттай үед алдааны талбар үргэлж null байна.
    timestamp: new Date().toISOString(), // Response үүссэн цаг.
  });
};

export const sendError = (res, message, errors = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false, // Алдаа гарсан гэдгийг тэмдэглэх boolean.
    message, // Алдааны ерөнхий тайлбар.
    data: null, // Алдаатай үед өгөгдөл байхгүй.
    errors, // Алдааны нэмэлт дэлгэрэнгүй мэдээлэл.
    timestamp: new Date().toISOString(), // Response үүссэн timestamp.
  });
};
