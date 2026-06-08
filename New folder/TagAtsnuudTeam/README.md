# Заал Захиалгын Систем (Hall Booking System) - Шаардлагын Баримт Бичиг


MYNGAA TAGH ATS

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
* dotenv
* cors
* cache
* RateLimit
* express-async-handler
* multer












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
