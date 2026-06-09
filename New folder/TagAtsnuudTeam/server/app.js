const express = require("express");
const cors = require("cors");
require("./src/config/env").loadEnv();

const authRoutes = require("./src/routes/auth.routes");
const hallRoutes = require("./src/routes/hall.routes");
const categoryRoutes = require("./src/routes/category.routes");
const db = require("./src/config/db");
const { globalLimiter, authLimiter, apiLimiter } = require("./src/middleware/rateLimit.middleware");
const { notFound, errorHandler } = require("./src/middleware/error.middleware");
const { sendSuccess } = require("./src/utils/response");
const paymentController = require('./src/controllers/payment.controller');
const paymentRoutes = require('./src/routes/payment.routes');
const v2Routes = require('./src/routes/v2.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.post(
  '/api/v1/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);
app.use(express.json());
app.use((req, res, next) => {
  req.cookies = Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .filter(Boolean)
      .map((cookie) => {
        const [key, ...value] = cookie.trim().split("=");
        return [key, decodeURIComponent(value.join("="))];
      })
  );
  next();
});
app.use("/uploads", express.static("uploads"));

app.use(globalLimiter);
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api", apiLimiter);

app.get("/api/v1/health", (req, res) => {
  sendSuccess(res, { version: "v1", service: "Hall Booking API" }, "API ажиллаж байна");
});

app.use("/api/v1/halls", hallRoutes);
app.use("/api/v1/categories", categoryRoutes);

app.get("/api/v2", (req, res) => {
  sendSuccess(res, { version: "v2", status: "placeholder" }, "API v2 дараа нэмэгдэнэ");
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await db.testConnection();
    console.log("MySQL database connected");
  } catch (error) {
    console.error("MySQL database connection failed:", error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
