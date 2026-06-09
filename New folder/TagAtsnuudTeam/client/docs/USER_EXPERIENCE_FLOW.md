# Hall Booking System - User Experience Flow

## 🔄 Complete User Journey Map

### 1. Guest Flow (Unauthenticated)

```
┌─────────────┐
│   Homepage  │  - Browse halls with filters
│   (Public)  │  - View all halls in grid
└──────┬──────┘
       │
       ├──→ Click Hall Card
       │    └──→ [HallDetailPage]
       │         - View full details
       │         - See amenities & policies
       │         - Read reviews
       │         - Click "Book Now"
       │           └──→ Redirect to Login
       │
       └──→ Click "Login" button
            └──→ [LoginPage] (Member 1)
```

### 2. New User Registration

```
┌──────────────────┐
│  [LoginPage]     │
│  Click Register  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ [RegisterPage]   │  - Enter name, email, password
│ (Member 1)       │  - Password validation (6+ chars)
│                  │  - Submit → Backend creates user
└────────┬─────────┘
         │
         ▼ Success
┌──────────────────┐
│ Tokens Created   │  - Access token (1h)
│ Stored in Local  │  - Refresh token (7d)
│ Storage          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ [HomePage]       │  - Ready to browse & book
│ Authenticated    │
└──────────────────┘
```

### 3. Existing User Login

```
┌──────────────────┐
│  [LoginPage]     │  - Enter email & password
│  (Member 1)      │  - Backend validates
└────────┬─────────┘
         │
         ├─→ Invalid ──→ Error message
         │
         └─→ Valid
              │
              ▼
         ┌──────────────────┐
         │ Tokens Created   │  - Access & Refresh tokens
         │ Stored in Local  │  - User profile saved
         │ Storage          │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ [HomePage]       │  - User ready to browse
         │ Authenticated    │
         └──────────────────┘
```

### 4. Hall Discovery & Search

```
┌──────────────────────────┐
│  [HomePage]              │
│  Hall Listing (6 cards)  │
└────────┬─────────────────┘
         │
         ├─→ Sidebar Filters
         │   │
         │   ├─→ Category Filter
         │   │   ├─→ All
         │   │   ├─→ Luxury
         │   │   ├─→ Business
         │   │   └─→ Casual
         │   │
         │   ├─→ Price Range
         │   │   └─→ Slider (₮0 - ₮500K)
         │   │
         │   └─→ Sort By
         │       ├─→ Most Popular
         │       ├─→ Price: Low to High
         │       ├─→ Price: High to Low
         │       └─→ Highest Rated
         │
         ├─→ Header Search
         │   └─→ Type hall name → Redirect with search param
         │
         ├─→ Click Hall Card
         │   └─→ [HallDetailPage]
         │
         └─→ Pagination
             └─→ Click page number → Load more halls
```

### 5. Hall Detail & Review

```
┌──────────────────┐
│[HallDetailPage]  │
└────────┬─────────┘
         │
         ├─→ Main Image (80% width)
         │   └─→ Large featured image
         │
         ├─→ Gallery Grid (4 smaller images)
         │   └─→ Alternative views
         │
         ├─→ Right Column Details
         │   ├─→ Title & Rating
         │   ├─→ Price Display (₮XXX,XXX/hr)
         │   ├─→ Description
         │   ├─→ Amenities Grid (8 items)
         │   ├─→ Booking Policies
         │   └─→ "Book Now" Button
         │
         └─→ Reviews Section
             ├─→ Review cards with ratings
             ├─→ Author name & date
             └─→ Review text
```

### 6. Booking Process

```
┌──────────────────┐
│ Click "Book Now" │
│ [HallDetailPage] │
└────────┬─────────┘
         │
         ▼ Protected Route Check
    ┌─────┴──────┐
    │            │
    ├─→ Not Auth? → Redirect to [LoginPage]
    │
    └─→ Authenticated
         │
         ▼
┌────────────────────┐
│  [BookingPage]     │
│  Booking Form      │  Left Column: Form
│  + Summary Sidebar │  Right Column: Summary (Sticky)
└────────┬───────────┘
         │
         ├─→ Event Type Dropdown (6 types)
         │   ├─→ Wedding
         │   ├─→ Birthday Party
         │   ├─→ Corporate Event
         │   ├─→ Conference
         │   ├─→ Business Meeting
         │   └─→ Other
         │
         ├─→ Date Picker (HTML date input)
         │
         ├─→ Time Inputs
         │   ├─→ Start Time
         │   ├─→ End Time
         │   └─→ Auto-calculates duration
         │
         ├─→ Guest Count (1-500)
         │
         ├─→ Notes Textarea (optional)
         │
         └─→ "Review Booking" Button
             │
             ▼
         ┌──────────────────┐
         │ Confirmation     │ - Modal overlay
         │ Modal            │ - Booking summary
         │                  │ - Total cost display
         │                  │ - Deposit info (30%)
         │                  │ - [Back] [Confirm & Pay]
         └────┬─────────────┘
              │
              ├─→ Click Back → Edit form
              │
              └─→ Click Confirm
                   │
                   ▼ (Ready for Member 4 Payment)
              [Payment Process]
```

### 7. My Bookings (History)

```
┌──────────────────┐
│ Header: Click    │
│ "My Bookings"    │
└────────┬─────────┘
         │ Protected Route
         ▼
┌──────────────────┐
│[MyBookingsPage]  │
└────────┬─────────┘
         │
         ├─→ Filter Tabs
         │   ├─→ 📅 Upcoming (default)
         │   ├─→ ✅ Past
         │   └─→ 📋 All
         │
         └─→ Booking Cards List
             ├─→ Hall name + Status badge
             │   ├─→ Confirmed (green)
             │   ├─→ Completed (blue)
             │   ├─→ Cancelled (red)
             │   └─→ Pending (amber)
             │
             ├─→ Booking details
             │   ├─→ 📅 Date
             │   ├─→ ⏰ Time
             │   ├─→ 👥 Guests
             │   └─→ 🎊 Event Type
             │
             ├─→ Price display
             │
             └─→ Action buttons
                 ├─→ View Details
                 ├─→ Modify (if confirmed)
                 └─→ Cancel (if confirmed)
```

### 8. User Profile

```
┌──────────────────┐
│ Header: User     │
│ Menu → Profile   │
└────────┬─────────┘
         │ Protected Route
         ▼
┌──────────────────┐
│[ProfilePage]     │ (From Member 1)
│(Member 1)        │
└────────┬─────────┘
         │
         ├─→ Avatar (with initials)
         ├─→ User Info Display
         ├─→ Role Badge (User/Owner/Admin)
         └─→ Action Buttons
             ├─→ Go to Dashboard (if owner/admin)
             ├─→ Edit Profile
             └─→ Logout
```

### 9. Owner Dashboard

```
┌──────────────────────┐
│ Profile → Dashboard  │
│ OR /owner/dashboard  │
└────────┬─────────────┘
         │ Protected (role: owner, admin)
         ▼
┌──────────────────────┐
│[OwnerDashboard]      │
└────────┬─────────────┘
         │
         ├─→ Statistics Cards (4)
         │   ├─→ Total Halls
         │   ├─→ Total Bookings
         │   ├─→ Total Earnings
         │   └─→ This Month
         │
         ├─→ Hall Management Table
         │   ├─→ Hall Name, Bookings, Earnings
         │   ├─→ Occupancy Rate (progress bar)
         │   ├─→ Status (Active/Inactive)
         │   └─→ Actions (Edit, View Bookings)
         │
         ├─→ Recent Bookings List
         │   └─→ Event type, Date, Price, Status
         │
         └─→ Quick Actions (4 buttons)
             ├─→ Upload Photos
             ├─→ Settings
             ├─→ Manage Payments
             └─→ View Reports
```

### 10. Admin Dashboard

```
┌──────────────────────┐
│ Profile → Dashboard  │
│ OR /admin/dashboard  │
└────────┬─────────────┘
         │ Protected (role: admin)
         ▼
┌──────────────────────┐
│[AdminDashboard]      │
└────────┬─────────────┘
         │
         ├─→ Metrics Grid (6 cards)
         │   ├─→ Total Users
         │   ├─→ Total Bookings
         │   ├─→ Total Revenue
         │   ├─→ Platform Fee
         │   ├─→ Active Halls
         │   └─→ Hall Owners
         │
         ├─→ System Status (4 indicators)
         │   ├─→ Database (Healthy/Down)
         │   ├─→ API (Online/Offline)
         │   ├─→ Storage (75% used)
         │   └─→ Uptime (99.8%)
         │
         ├─→ Recent Bookings Activity Feed
         │   └─→ Recent transactions with times
         │
         ├─→ Revenue Breakdown Charts
         │   ├─→ Bookings revenue (90%)
         │   └─→ Platform fee (10%)
         │
         ├─→ User Verification Queue
         │   ├─→ Table with pending users
         │   ├─→ User info, submission date
         │   └─→ Approve/Reject buttons
         │
         └─→ Admin Tools Grid (8 buttons)
             ├─→ Manage Users
             ├─→ Manage Halls
             ├─→ Manage Bookings
             ├─→ Review Reports
             ├─→ Financial Reports
             ├─→ Analytics
             ├─→ Send Messages
             └─→ Settings
```

### 11. Logout Flow

```
┌──────────────────────┐
│ Header: User Menu    │
│ Click "Logout"       │
└────────┬─────────────┘
         │
         ├─→ API: POST /auth/logout
         │   └─→ Backend clears refresh token
         │
         ├─→ Clear localStorage
         │   ├─→ accessToken
         │   ├─→ refreshToken
         │   └─→ user
         │
         └─→ Redirect to [LoginPage]
             └─→ Ready for new login
```

## 📊 Component Hierarchy

```
App (Router)
├── Header (Global)
│   ├── Logo
│   ├── Search
│   └── User Menu
├── Main Router
│   ├── HomePage
│   │   ├── Sidebar Filters
│   │   └── Hall Grid
│   ├── HallDetailPage
│   │   ├── Gallery
│   │   └── Details Sidebar
│   ├── BookingPage (Protected)
│   │   ├── Form
│   │   └── Summary Sidebar
│   ├── MyBookingsPage (Protected)
│   │   ├── Filter Tabs
│   │   └── Bookings List
│   ├── OwnerDashboard (Protected)
│   │   ├── Statistics
│   │   ├── Hall Table
│   │   └── Quick Actions
│   ├── AdminDashboard (Protected)
│   │   ├── Metrics
│   │   ├── Status
│   │   └── Tools
│   ├── LoginPage (from Member 1)
│   ├── RegisterPage (from Member 1)
│   ├── ProfilePage (from Member 1)
│   └── NotFoundPage
└── Footer (Global)
```

## 🎯 Key Interactions

### Real-time Features
- ✅ Price updates when duration changes
- ✅ Hall list filters instantly
- ✅ Search redirect on submit
- ✅ Pagination page selection
- ✅ Modal confirmation
- ✅ Status badge colors

### Validation Features
- ✅ Date validation (future dates only)
- ✅ Guest count range (1-500)
- ✅ Time validation (end > start)
- ✅ Price calculations
- ✅ Empty state handling

### User Experience
- ✅ Sticky header on scroll
- ✅ Loading states on pages
- ✅ Empty states with messages
- ✅ Error notifications
- ✅ Success confirmations
- ✅ Smooth transitions

## 📱 Responsive Breakpoints

### Desktop (1200px+)
- Multi-column layouts
- Sidebar visible
- Full navigation
- 3-4 column grids

### Tablet (768px - 1199px)
- 2-column layouts
- Collapsible sidebar
- Adjusted spacing
- 2 column grids

### Mobile (<768px)
- Single column
- Full-width inputs
- Stacked buttons
- 1 column grids
- Touch-friendly sizes

---

**Frontend Version**: 1.0.0
**Last Updated**: 2024
