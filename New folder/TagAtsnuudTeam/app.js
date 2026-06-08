const express = require("express");
const cors = require("cors");
require("./src/config/env").loadEnv();

const hallRoutes = require("./src/routes/hall.routes");
const categoryRoutes = require("./src/routes/category.routes");
const db = require("./src/config/db");
const { globalLimiter, authLimiter, apiLimiter } = require("./src/middleware/rateLimit.middleware");
const { notFound, errorHandler } = require("./src/middleware/error.middleware");
const { sendSuccess } = require("./src/utils/response");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(globalLimiter);
app.use("/api/auth", authLimiter);
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
