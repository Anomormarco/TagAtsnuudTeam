import cors from "cors"; // CORS middleware-г express application-д нэмэхэд ашиглана.
import dotenv from "dotenv"; // .env файлд агуулсан тохиргоог process.env рүү ачаалах зориулалттай.
import express from "express"; // Express framework-ийг import хийж HTTP server үүсгэнэ.
import bookingRoutes from "./routes/bookingRoutes.js"; // Booking-рүү холбогдох router-ийг import хийнэ.
import reviewRoutes from "./routes/reviewRoutes.js"; // Booking review-д зориулсан router-ийг import хийнэ.
import hallRoutes from "./routes/hallRoutes.js"; // Заалны боломжит цагийн router-ийг import хийнэ.
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js"; // Алдааны төв middleware-үүдийг import хийнэ.
import apiLimiter from "./middleware/rateLimiter.js"; // Rate limit middleware

dotenv.config(); // .env файл дахь тохиргоог process.env рүү ачаална.

const app = express(); // Express application instance үүсгэнэ.
const port = process.env.PORT || 5000; // Орчингийн PORT байхгүй бол 5000-ыг default болгон ашиглана.

app.use(cors()); // CORS-г идэвхжүүлж frontend-ээс API руу дуудах боломж нээнэ.
app.use(express.json()); // JSON request body-г автоматаар задлан req.body-д өгнө.
app.use("/api/", apiLimiter); // Apply rate limiter to API routes

app.get("/", (req, res) => res.json({ message: "Hall Booking API ажиллаж байна." })); // Root endpoint дээр API ажиллаж байгааг шалгах response.
app.use("/api/v1/bookings", bookingRoutes); // Booking маршрутуудыг /api/v1/bookings prefix-ээр холбож өгнө.
app.use("/api/v1/bookings/:bookingId/reviews", reviewRoutes); // Booking review маршрутуудыг гид өдөршүүлэхээр холбож өгнө.
app.use("/api/v1/halls", hallRoutes); // Заалны боломжит цагийн холбоосыг холбож өгнө.
app.use(notFoundHandler); // Илэрцгүй endpoint-д 404 алдааг илгээх middleware.
app.use(errorHandler); // Төгсгөлд нь глобал алдааны middleware-г байршуулна.

const server = app.listen(port, () => {
  console.log(`Backend server http://localhost:${port} дээр ажиллаж байна.`); // Сервер амжилттай ассан тохиолдолд Console дээр лог бичнэ.
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Порт ${port} ашиглагдаж байна. Өөр порт сонгох эсвэл 5000-р процессийг зогсоогоод дахин ажиллуулна уу.`);
    process.exit(1);
  }
  console.error("Server error:", error);
  process.exit(1);
});
