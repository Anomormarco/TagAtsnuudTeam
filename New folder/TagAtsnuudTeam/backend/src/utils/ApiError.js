export class ApiError extends Error {
  constructor(statusCode = 500, message = "Алдаа гарлаа.", errors = null) {
    super(message); // Error-д message-г өгнө.
    this.name = "ApiError"; // Алдааны төрөл танихад ашиглана.
    this.statusCode = statusCode; // ApiError-д статус код нэмнэ.
    this.errors = errors; // Нэмэлт алдааны дэлгэрэнгүйг хадгална.
  }
}
