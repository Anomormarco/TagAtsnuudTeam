
require('dotenv').config();

// App-ийн үндсэн dependency болон route/middleware-үүдийг ачаална.
const path = require('path');
const cors = require('cors');
const express = require('express');
const asyncHandler = require('express-async-handler');
const paymentDashboardDocs = require('./docs/swagger-payment-dashboard.json');
const createHttpError = require('./backend/utils/httpError');

const dashboardRoutes = require('./backend/dashboard/dashboard.routes');
const errorMiddleware = require('./backend/middleware/error.middleware');
const { apiLimiter } = require('./backend/middleware/rateLimit.middleware');
const paymentController = require('./backend/payments/payment.controller');
const paymentRoutes = require('./backend/payments/payment.routes');
const v2Routes = require('./backend/routes/v2.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Stripe webhook raw body шаарддаг тул express.json()-оос өмнө тусдаа route болгон байрлуулна.
app.post(
  '/api/v1/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend-ийн static HTML/CSS/JS файлуудыг шууд serve хийнэ.
app.use(express.static(path.join(__dirname, 'frontend')));

// API бүр дээр rate limit тавиад, одоогийн stable хувилбарыг /api/v1 дор холбоно.
app.use('/api', apiLimiter);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v2', v2Routes);

// Swagger/OpenAPI JSON docs руу богино redirect хийж өгнө.
app.get('/api-docs', asyncHandler(async (req, res) => {
  res.redirect('/api-docs/payment-dashboard.json');
}));

app.get('/api-docs/payment-dashboard.json', asyncHandler(async (req, res) => {
  res.json(paymentDashboardDocs);
}));

app.get('/', asyncHandler(async (req, res) => {
  res.redirect('/checkout');
}));

// Дээрх route-уудад таараагүй бүх request 404 error болно.
app.use((req, res, next) => {
  next(createHttpError(404, 'Route not found'));
});

// Бүх error нэг стандарт JSON хэлбэрээр буцна.
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
