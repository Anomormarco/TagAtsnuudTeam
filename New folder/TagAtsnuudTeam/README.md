# TagAtsnuud Team - Hall Booking System

A comprehensive hall booking platform built with **Node.js/Express** backend and **React** frontend. Features authentication, hall management, booking, reviews, payments, and admin/owner dashboards.

## 📋 Project Overview

### Day 1 — Foundation + MVC + Versioning + Cache Setup

#### **Member 1 — Auth & User (✅ COMPLETED)**
Backend: User model, Auth routes, controllers, services, repositories
Frontend: Login, Register, Profile pages

#### **Member 2 — Hall & Category** (📋 Planned)
Backend: Hall & Category models, routes, controllers, services, repositories
Frontend: Hall list/detail pages, category filters

#### **Member 3 — Booking & Review** (📋 Planned)
Backend: Booking & Review models, routes, controllers, services, repositories
Frontend: Booking page, my bookings, reviews

#### **Member 4 — Payment, Dashboard & Common** (📋 Planned)
Backend: Payment, OwnderPayout models, routes, controllers, services, repositories, dashboard
Frontend: Admin/Owner dashboards, payment pages

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository** (or extract the project)
```bash
cd TagAtsnuudTeam
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hall-booking
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=1h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRY=7d
```

4. **Start MongoDB**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Windows
# Start MongoDB from Services or run mongod manually

# Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

5. **Run the backend server**
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server will start on `http://localhost:5000`

---

## 📁 Project Structure

```
TagAtsnuudTeam/
├── Models/                          # Database schemas
│   └── user.model.js
├── Controllers/                     # Business logic handlers
│   └── AuthController.js
├── Services/                        # Utility services (JWT, validation, etc.)
│   └── auth.service.js
├── Repositories/                    # Database operations
│   └── user.repository.js
├── Middleware/                      # Express middleware
│   ├── authMiddleware.js           # JWT verification
│   └── rateLimit.middleware.js     # Rate limiting (Day 3)
├── Routhes/                         # API routes
│   └── AuthRouther.js
├── utils/                           # Utility functions
│   ├── response.js                 # Response formatting
│   ├── pagination.js               # Pagination logic
│   ├── commission.js               # Commission calculation
│   └── cache.js                    # In-memory caching
├── config/                          # Configuration
│   └── db.js                       # Database connection
├── frontend/                        # React frontend (future)
│   └── src/
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   └── ProfilePage.jsx
│       ├── components/
│       └── utils/
├── app.js                           # Express app entry point
├── package.json
├── .env.example
└── README.md
```

---

## 🔐 API Documentation

### Auth Endpoints (All under `/api/v1/auth`)

#### 1. Register User
```
POST /api/v1/auth/register
```
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User
```
POST /api/v1/auth/login
```
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Current User Profile
```
GET /api/v1/auth/me
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "role": "user",
    "avatar": null,
    "createdAt": "2024-06-07T10:00:00.000Z"
  }
}
```

#### 4. Logout
```
POST /api/v1/auth/logout
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### 5. Refresh Token
```
POST /api/v1/auth/refresh-token
```
**Method 1 - Via Cookie (automatic):**
```
(Cookie: refreshToken=...)
```

**Method 2 - Via Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🔒 Security Features (Day 1 Member 1)

- ✅ **Password Hashing**: bcryptjs (10 salt rounds)
- ✅ **JWT Tokens**: Access token (1h) + Refresh token (7d)
- ✅ **HttpOnly Cookies**: Secure refresh token storage
- ✅ **Token Verification**: Custom middleware for protected routes
- ✅ **Role-Based Fields**: User model supports admin/owner/user roles
- ✅ **Email Validation**: Format validation + duplicate check
- ✅ **Password Validation**: Minimum 6 characters required
- ✅ **Middleware Stack**: Error handling, CORS-ready, rate limiting (Day 3)

---

## 📊 User Model Schema

```javascript
{
  name: String (required, trimmed),
  email: String (required, unique, lowercase),
  password: String (required, min 6, hashed),
  phone: String (optional),
  role: String (enum: 'admin', 'owner', 'user', default: 'user'),
  avatar: String (optional URL),
  refreshToken: String (optional, selected=false),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🎨 Frontend Pages (React)

### LoginPage.jsx
- Email & password input
- Error message display
- Loading state
- Link to register page
- Axios integration with `/api/v1/auth/login`
- Token storage in localStorage

### RegisterPage.jsx
- Name, email, password, confirm password inputs
- Form validation (password length, match)
- Error handling
- Link to login page
- Axios integration with `/api/v1/auth/register`

### ProfilePage.jsx
- Fetch user profile from `/api/v1/auth/me`
- Display avatar/initials
- Show user details (name, email, phone, role, joined date)
- Logout button
- Protected route (redirects to login if no token)

---

## 🗝️ Authentication Flow

1. **Register** → Hash password → Save user → Generate tokens → Return accessToken
2. **Login** → Verify email → Compare password → Generate tokens → Set refreshToken cookie
3. **Protected Routes** → Check Authorization header → Verify JWT → Attach user to request
4. **Refresh Token** → Verify refresh token → Generate new access token → Update cookie
5. **Logout** → Clear refresh token in DB → Clear cookie

---

## 📦 Dependencies

```json
{
  "bcryptjs": "^2.4.3",          // Password hashing
  "cookie-parser": "^1.4.6",     // Parse cookies
  "cors": "^2.8.6",              // Cross-origin support
  "express": "^5.2.1",           // Web framework
  "jsonwebtoken": "^9.1.2",      // JWT creation/verification
  "mongoose": "^7.5.0",          // MongoDB ODM
  "dotenv": "^16.3.1"            // Environment variables
}
```

---

## 🧪 Testing

Test the auth endpoints using **Postman** or **cURL**:

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456","confirmPassword":"123456"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"123456"}'

# Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## 📅 What's Next

- **Day 1 Member 2**: Hall & Category management
- **Day 1 Member 3**: Booking & Review system
- **Day 1 Member 4**: Payment, Dashboard, Rate limiting
- **Day 2**: Database integration, caching, optimization
- **Day 3**: Business logic, security, cache invalidation
- **Day 4**: Testing, documentation, deployment

---

## 📝 Notes

- JWT secret should be strong in production (use random generator)
- MongoDB connection URI should use Atlas or local instance
- Frontend Axios baseURL should be `/api/v1`
- Rate limiting middleware will be added in Day 3
- v2/v3 versioning will be implemented as breaking changes occur

---

## 👥 Team

- **Member 1** (You): Auth & User ✅
- **Member 2**: Hall & Category 📋
- **Member 3**: Booking & Review 📋
- **Member 4**: Payment & Dashboard 📋

---

## 📄 License

ISC

## 1. Төслийн танилцуулга

Заал Захиалгын Систем нь сургууль, спорт заал, хурлын танхим зэрэг объектуудыг онлайнаар хайх, сул цагийг харах, захиалах, төлбөр төлөх боломжтой веб систем юм.

Систем нь Marketplace загвараар ажиллана.

### Үйл ажиллагааны урсгал

```text
Хэрэглэгч → Заал захиална
Төлбөр → Stripe ашиглан төлнө
Админ → Шимтгэл авна
Эзэмшигч → Үлдэгдэл төлбөрөө авна
```

---

# 2. Системийн Архитектур

## Архитектурын төрөл

* REST API
* MVC Архитектур
* Monolith Архитектур
* Client-Server Архитектур

## Backend архитектур

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

## Frontend

* React.js SPA

## Backend

* Node.js
* Express.js

## Өгөгдлийн сан

* MySQL

---

# 3. Ашиглах Технологи

## Backend

* Node.js
* Express.js
* MySQL
* mysql2/promise
* JWT
* bcrypt
* Stripe
* Swagger/OpenAPI
* dotenv
* cors

## Frontend

* React.js
* React Router
* Axios
* Context API
* Tailwind CSS

## Database

* MySQL
* MySQL Workbench

---

# 4. Хэрэглэгчийн Эрхийн Түвшин

| Роль  | Эрх                                 |
| ----- | ----------------------------------- |
| User  | Заал хайх, захиалах, төлбөр төлөх   |
| Owner | Заал нэмэх, засах, орлого харах     |
| Admin | Бүх хэрэглэгч, заал, төлбөр удирдах |

---

# 5. Өгөгдлийн Сангийн Бүтэц

## users

```sql
id
name
email
password
phone
role
profile_image
created_at
updated_at
deleted_at
```

## halls

```sql
id
owner_id
name
description
location
capacity
price_per_hour
image_url
status
created_at
updated_at
deleted_at
```

## categories

```sql
id
name
```

### Ангиллын жишээ

* Сагсан бөмбөг
* Хөлбөмбөг
* Волейбол
* Бадминтон
* Ширээний теннис

## hall_categories

Олон-олонтой (Many-to-Many) холбоос

```sql
hall_id
category_id
```

## bookings

```sql
id
user_id
hall_id
start_time
end_time
total_price
status
created_at
updated_at
deleted_at
```

### Захиалгын төлөв

* PENDING (Хүлээгдэж буй)
* PAID (Төлөгдсөн)
* CANCELLED (Цуцлагдсан)
* COMPLETED (Дууссан)

## payments

```sql
id
booking_id
user_id
owner_id
amount
commission_rate
commission_amount
owner_amount
currency
stripe_session_id
stripe_payment_intent_id
payment_status
paid_at
```

## owner_payouts

```sql
id
owner_id
payment_id
amount
status
stripe_transfer_id
transferred_at
created_at
```

## reviews

```sql
id
user_id
hall_id
rating
comment
created_at
```

## refresh_tokens

```sql
id
user_id
token
expires_at
```

---

# 6. Хүснэгтүүдийн Холбоо

```text
User
 ├── Halls
 ├── Bookings
 ├── Reviews
 └── Refresh Tokens

Hall
 ├── Bookings
 ├── Reviews
 └── Categories

Booking
 └── Payment

Payment
 └── Owner Payout
```

---

# 7. Нийт Хүснэгтийн Тоо

1. users
2. halls
3. categories
4. hall_categories
5. bookings
6. payments
7. owner_payouts
8. reviews
9. refresh_tokens

### Нийт: 9 хүснэгт

---

# 8. Нэвтрэлт ба Баталгаажуулалт

### Бүртгүүлэх

```http
POST /api/v1/auth/register
```

### Нэвтрэх

```http
POST /api/v1/auth/login
```

### Гарах

```http
POST /api/v1/auth/logout
```

### Refresh Token

```http
POST /api/v1/auth/refresh-token
```

### Одоогийн хэрэглэгч

```http
GET /api/v1/auth/me
```

---

# 9. Заалын CRUD Үйлдлүүд

### Заалын жагсаалт

```http
GET /api/v1/halls
```

### Заалын дэлгэрэнгүй

```http
GET /api/v1/halls/:id
```

### Заал нэмэх

```http
POST /api/v1/halls
```

### Заал засах

```http
PUT /api/v1/halls/:id
```

### Хэсэгчлэн засах

```http
PATCH /api/v1/halls/:id
```

### Заал устгах

```http
DELETE /api/v1/halls/:id
```

### Сул цаг харах

```http
GET /api/v1/halls/:id/available-times
```

---

# 10. Захиалгын Модуль

### Захиалга үүсгэх

```http
POST /api/v1/bookings
```

### Миний захиалгууд

```http
GET /api/v1/bookings/my
```

### Захиалгын мэдээлэл

```http
GET /api/v1/bookings/:id
```

### Захиалга цуцлах

```http
PATCH /api/v1/bookings/:id/cancel
```

---

# 11. Сэтгэгдлийн Модуль

### Сэтгэгдэл үлдээх

```http
POST /api/v1/halls/:id/reviews
```

### Сэтгэгдлүүд авах

```http
GET /api/v1/halls/:id/reviews
```

---

# 12. Stripe Төлбөрийн Урсгал

```text
Хэрэглэгч
 ↓
Захиалга үүсгэнэ
 ↓
Stripe Checkout Session
 ↓
Төлбөр амжилттай
 ↓
Webhook
 ↓
Payment төлөв = PAID
 ↓
Booking төлөв = PAID
```

---

# 13. Шимтгэлийн Систем

### Жишээ

```text
Захиалгын үнэ = 100,000₮

Админы шимтгэл = 10%

Админ = 10,000₮
Эзэмшигч = 90,000₮
```

### Урсгал

```text
Хэрэглэгч
 ↓
Stripe Төлбөр
 ↓
Платформ
 ↓
Шимтгэл суутгана
 ↓
Эзэмшигчид шилжүүлнэ
```

---

# 14. Төлбөрийн Endpoint-ууд

```http
POST /api/v1/payments/checkout-session
POST /api/v1/payments/stripe/webhook
GET /api/v1/payments/my
GET /api/v1/payments/owner
GET /api/v1/payments/admin
GET /api/v1/payments/commission-report
POST /api/v1/payouts/:paymentId/transfer
```

---

# 15. Dashboard

## User Dashboard

* Миний захиалгууд
* Миний төлбөрүүд

## Owner Dashboard

* Миний заалууд
* Орлого
* Захиалгын статистик
* Төлбөр шилжүүлгийн түүх

## Admin Dashboard

* Нийт хэрэглэгч
* Нийт эзэмшигч
* Нийт заал
* Нийт захиалга
* Нийт орлого
* Нийт шимтгэл
* Сүүлийн төлбөрүүд
* Сүүлийн захиалгууд

---

# 16. Хайлт, Шүүлтүүр, Хуудасчлал

### Жишээ

```http
GET /api/v1/halls?keyword=sport&category=1&location=ub&page=1&size=10&sort=price,asc
```

### Pagination Response

```json
{
  "content": [],
  "page": 1,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10
}
```

---

# 17. Стандарт API Хариу

```json
{
  "success": true,
  "message": "Амжилттай",
  "data": {},
  "errors": null,
  "timestamp": "2026-01-01T00:00:00Z"
}
```

---

# 18. Баталгаажуулалтын Дүрэм

## User

* Email давтагдахгүй байх
* Нууц үг хамгийн багадаа 8 тэмдэгттэй байх

## Booking

* start_time < end_time
* Давхар захиалга үүсгэхгүй байх

## Review

* Rating 1-5 хооронд байх

## Hall

* price_per_hour > 0

## Файл оруулах

* jpg
* png
* webp
* Хамгийн ихдээ 5MB

---

# 19. Аюулгүй Байдал

## Authentication

* JWT Access Token
* JWT Refresh Token

## Password

* bcrypt Hash

## Authorization

* RBAC

## API Security

* Input Validation
* Input Sanitization
* Prepared Statements
* SQL Injection Protection
* CORS

## Stripe

* Signature Verification

---

# 20. Гүйцэтгэлийн Шаардлага

### API дундаж хариулах хугацаа

```text
< 200ms
```

### Dashboard

```text
< 500ms
```

### Индексүүд

```sql
users.email

halls.location
halls.price_per_hour

bookings.user_id
bookings.hall_id
bookings.start_time

payments.booking_id
payments.owner_id
payments.payment_status
```

---

# 21. Swagger Баримтжуулалт

Swagger/OpenAPI ашиглана.

Баримтжуулах зүйлс:

* Endpoint тайлбар
* Request жишээ
* Response жишээ
* Error жишээ
* JWT Authorization

```http
/api-docs
```

---

# 22. React Client Хуудсууд

## Public

* Нүүр хуудас
* Заалын жагсаалт
* Заалын дэлгэрэнгүй
* Нэвтрэх
* Бүртгүүлэх

## User

* Миний профайл
* Миний захиалга
* Миний төлбөр

## Owner

* Эзэмшигчийн Dashboard
* Миний заалууд
* Заал нэмэх
* Заал засах
* Орлого
* Төлбөрийн түүх

## Admin

* Админы Dashboard
* Хэрэглэгч удирдах
* Заал удирдах
* Захиалга удирдах
* Төлбөр удирдах
* Шимтгэлийн тайлан

---

# 24. Хөгжүүлэлтийн Үе Шатууд

1. Project Setup
2. Database Schema
3. Authentication
4. Role Based Pages
5. Hall CRUD
6. Booking Logic
7. Stripe Payment
8. Commission & Owner Payout
9. Dashboard & Reports
10. Swagger
11. Testing
12. Deployment

---

# 25. Багийн Ажил Хуваарилалт (4 хүн)

## Гишүүн 1

* Authentication Module
* User Module

## Гишүүн 2

* Hall Module
* Category Module

## Гишүүн 3

* Booking Module
* Review Module

## Гишүүн 4

* Payment Module
* Dashboard Module
* Swagger Documentation

### Бүх гишүүд оролцох хэсэг

* Frontend
* Backend
* Database
* Testing
* Documentation
# 13.1 Автомат Шилжүүлгийн Систем (Automatic Payout System)

## Ерөнхий Тайлбар

Хэрэглэгчийн төлсөн бүх төлбөр эхлээд платформын Stripe дансанд төвлөрнө.

Систем нь төлбөр бүр дээр автоматаар шимтгэл бодож, эзэмшигчийн үлдэгдлийг бүртгэнэ.

Эзэмшигчийн мөнгийг шууд шилжүүлэхгүй бөгөөд платформ дээр тодорхой хугацаанд хадгалсны дараа автоматаар шилжүүлнэ.

---

## Төлбөр Хуваарилах Логик

Жишээ:

```text
Захиалгын үнэ = 100,000₮

Платформын шимтгэл = 10%

Админ авах дүн = 10,000₮

Эзэмшигч авах дүн = 90,000₮
```

payments хүснэгтэд:

```sql
amount = 100000

commission_rate = 10

commission_amount = 10000

owner_amount = 90000
```

---

## Төлбөрийн Урсгал

```text
Хэрэглэгч
 ↓
Stripe Checkout
 ↓
Platform Stripe Account
 ↓
Payment Success
 ↓
Webhook
 ↓
Payment = PAID
 ↓
Booking = PAID
 ↓
10% Commission
 ↓
90% Owner Balance
```

---

## Автомат Payout Хуваарь

Эзэмшигчийн үлдэгдэл мөнгө платформын дансанд хуримтлагдана.

Систем дараах хуваарийн дагуу автоматаар шилжүүлэг хийнэ.

### Хувилбар

```text
15 хоног тутам
эсвэл
Сар бүрийн 1 болон 15-ны өдөр
```

---

## Cron Job

Автомат шилжүүлгийг Cron Job ашиглан гүйцэтгэнэ.

Жишээ:

```text
0 0 1,15 * *
```

Утга:

```text
Сар бүрийн 1 болон 15-ны өдрийн
00:00 цагт ажиллана.
```

---

## Автомат Шилжүүлгийн Урсгал

```text
User Payment
 ↓
Stripe
 ↓
Platform Wallet
 ↓
Commission Deduction
 ↓
Owner Balance
 ↓
Scheduled Payout Job
 ↓
Stripe Transfer
 ↓
Owner Bank Account
```

---

## Owner Dashboard

Эзэмшигч дараах мэдээллийг харах боломжтой байна.

```json
{
  "totalRevenue": 5000000,
  "pendingPayout": 3200000,
  "paidOut": 1800000,
  "nextPayoutDate": "2026-06-15"
}
```

### Үзүүлэх мэдээлэл

* Нийт орлого
* Хүлээгдэж буй шилжүүлэг
* Шилжүүлсэн нийт дүн
* Дараагийн шилжүүлгийн огноо
* Payout түүх

---

## Admin Dashboard

Админ дараах мэдээллийг харах боломжтой байна.

* Нийт шимтгэл
* Хуримтлагдсан үлдэгдэл
* Өнөөдөр шилжүүлсэн дүн
* Амжилтгүй шилжүүлэг
* Дараагийн payout огноо
* Payout статистик

---

## owner_payouts Хүснэгтийн Төлөв

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

### Тайлбар

| Төлөв      | Тайлбар                       |
| ---------- | ----------------------------- |
| PENDING    | Шилжүүлэхээр хүлээгдэж байгаа |
| PROCESSING | Stripe руу илгээгдэж байгаа   |
| COMPLETED  | Амжилттай шилжсэн             |
| FAILED     | Шилжүүлэг амжилтгүй болсон    |

---

## Шинээр Нэмэгдэх Хүснэгт

### payout_schedules

```sql
id
owner_id
next_payout_date
payout_frequency
is_active
created_at
updated_at
```

### payout_frequency

```text
WEEKLY
BIWEEKLY
MONTHLY
```

---

## Stripe Connect

Owner бүр Stripe Connect данстай байна.

```text
Platform Stripe Account
          │
          ▼
Stripe Connect
          │
          ▼
Owner Bank Account
```

---

## Payout Service

```text
PayoutSchedulerService

├── findPendingPayments()
├── calculateOwnerAmount()
├── createTransfer()
├── updatePayoutStatus()
├── savePayoutHistory()
└── notifyOwner()
```

---

## Нэмэгдэх API Endpoint

### Owner Balance

```http
GET /api/v1/payouts/balance
```

### Payout History

```http
GET /api/v1/payouts/history
```

### Next Payout

```http
GET /api/v1/payouts/next
```

### Manual Payout (Admin)

```http
POST /api/v1/payouts/run
```

---

## Бизнес Шаардлага

* Хэрэглэгчийн бүх төлбөр эхлээд платформын Stripe дансанд хадгалагдана.
* Платформ автоматаар 10%-ийн шимтгэл суутгана.
* Үлдсэн 90%-ийг эзэмшигчийн үлдэгдэлд бүртгэнэ.
* Эзэмшигчийн үлдэгдэл мөнгө платформ дээр хадгалагдана.
* 15 хоног тутам автоматаар Stripe Connect ашиглан эзэмшигчийн данс руу шилжүүлнэ.
* Бүх шилжүүлгийн түүх owner_payouts хүснэгтэд хадгалагдана.
* Owner болон Admin Dashboard дээр payout мэдээлэл харагдана.
* Амжилтгүй шилжүүлэг дахин оролдох механизмтай байна.
