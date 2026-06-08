import { sendError } from "../utils/apiResponse.js"; // Алдааны JSON response үүсгэх helper.
import { ApiError } from "../utils/ApiError.js"; // Тусгай статус кодтой алдааны object.

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, "Endpoint олдсонгүй.")); // Илэрцгүй URL-д 404 ApiError дамжуулна.
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500; // Алдааны статус код байхгүй бол 500 хэрэглэнэ.
  const message = err.message || "Серверийн алдаа гарлаа."; // Алдааны текст байхгүй бол default message.
  const errors = err.errors || null; // Нэмэлт алдааны дэлгэрэнгүйг хадгална.

  if (res.headersSent) {  
    return next(err); // Хэрэв response аль хэдийн илгээгдсэн бол дахин илгээхгүй, дараагийн middleware-д өгнө.
  }

  return sendError(res, message, errors, statusCode); // Тохирох форматаар алдааны JSON response илгээдэг.
};
