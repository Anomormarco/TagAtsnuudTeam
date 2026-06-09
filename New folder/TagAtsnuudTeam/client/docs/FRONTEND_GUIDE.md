# HallBook Frontend - Modern UI/UX Implementation

Professional React-based hall booking system with modern design patterns, responsive layouts, and comprehensive user interfaces.

## 🏗️ Architecture Overview

```
frontend/src/
├── components/
│   ├── Header.jsx          # Navigation header with search & user menu
│   └── Footer.jsx          # Application footer
├── pages/
│   ├── HomePage.jsx        # Hall listing with filters & pagination
│   ├── HallDetailPage.jsx  # Detailed hall information & gallery
│   ├── BookingPage.jsx     # Booking form with price calculation
│   ├── MyBookingsPage.jsx  # User's bookings history
│   ├── AdminDashboard.jsx  # Admin analytics & management
│   ├── OwnerDashboard.jsx  # Owner hall management & earnings
│   └── NotFoundPage.jsx    # 404 error page
├── utils/
│   ├── apiClient.js        # Axios HTTP client with auth
│   └── tokenManager.js     # Token & user management
├── App.jsx                 # Main router & layout
├── index.css              # Global styles
└── main.jsx               # React entry point
```

## 🎨 Design System

### Color Palette
- **Primary Gradient**: `#667eea` → `#764ba2` (Purple/Indigo)
- **Success**: `#28a745` (Green)
- **Danger**: `#dc3545` (Red)
- **Warning**: `#ffc107` (Amber)
- **Background**: `#f8f9fa` (Light Gray)
- **Text**: `#333333` (Dark)
- **Muted**: `#666666` (Gray)

### Components & Usage

#### Header Component
- Sticky navigation with logo
- Search functionality with redirect
- User menu with profile/dashboard/logout
- Responsive mobile support
- Location: [components/Header.jsx](src/components/Header.jsx)

#### Footer Component
- Company info sections
- Quick links navigation
- Social media links
- Copyright notice
- Location: [components/Footer.jsx](src/components/Footer.jsx)

## 📄 Pages Overview

### 1. HomePage - Hall Listing
**Route**: `/`
**Features**:
- Grid-based hall card display
- Multi-filter sidebar (category, price, sort)
- Real-time search integration
- Pagination system (6 items per page)
- Responsive grid layout
- Mock data with 6 sample halls

**Files**: [pages/HomePage.jsx](src/pages/HomePage.jsx)

### 2. HallDetailPage - Hall Details
**Route**: `/halls/:id`
**Features**:
- Large header image with gallery
- Complete hall information
- Amenities grid (8+ amenities)
- Booking policies
- Guest reviews section
- Call-to-action booking button
- Back navigation

**Files**: [pages/HallDetailPage.jsx](src/pages/HallDetailPage.jsx)

### 3. BookingPage - Reservation Form
**Route**: `/booking/:hallId` (Protected)
**Features**:
- Event type selection (6 types)
- Date & time input with duration calculation
- Guest count input
- Real-time price calculation
- 30% deposit highlight
- Booking confirmation modal
- Summary sticky sidebar

**Files**: [pages/BookingPage.jsx](src/pages/BookingPage.jsx)

### 4. MyBookingsPage - User Bookings
**Route**: `/bookings` (Protected)
**Features**:
- Booking filter tabs (Upcoming/Past/All)
- Status badges with color coding
- Booking details grid
- Action buttons (View/Modify/Cancel)
- Empty state handling
- Total price display

**Files**: [pages/MyBookingsPage.jsx](src/pages/MyBookingsPage.jsx)

### 5. OwnerDashboard - Hall Management
**Route**: `/owner/dashboard` (Protected - Owner/Admin)
**Features**:
- 4 key statistics cards
- Hall management table
- Occupancy rate visualization
- Recent bookings list
- Quick action buttons (4 actions)
- Earnings tracking

**Files**: [pages/OwnerDashboard.jsx](src/pages/OwnerDashboard.jsx)

### 6. AdminDashboard - System Management
**Route**: `/admin/dashboard` (Protected - Admin Only)
**Features**:
- 6 system-wide metrics
- System status monitoring (4 statuses)
- Recent activity feed
- Revenue breakdown chart
- User verification queue
- 8 admin tool buttons
- Financial reporting

**Files**: [pages/AdminDashboard.jsx](src/pages/AdminDashboard.jsx)

### 7. NotFoundPage - 404 Error
**Route**: `*` (catch-all)
**Features**:
- Gradient background
- Large 404 display
- Helpful error message
- Return home button

**Files**: [pages/NotFoundPage.jsx](src/pages/NotFoundPage.jsx)

## 🔐 Authentication & Authorization

### Protected Routes
```javascript
<ProtectedRoute>          {/* Default: all authenticated users */}
<ProtectedRoute requiredRole={['admin']}>
<ProtectedRoute requiredRole={['owner', 'admin']}>
```

**Token Manager** (`utils/tokenManager.js`):
- `setTokens()` / `clearTokens()`: Manage localStorage tokens
- `getAccessToken()` / `getRefreshToken()`: Retrieve tokens
- `isAuthenticated()`: Check auth status
- `setUser()` / `getUser()`: User profile management
- `hasRole()` / `hasAnyRole()`: Role checking

**API Client** (`utils/apiClient.js`):
- Base URL: `process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'`
- Auto token injection via `Authorization: Bearer`
- Auto 401 handling with token refresh
- withCredentials enabled for cookies

## 🎯 Key Features

### Hall Listing (HomePage)
- ✅ Category filtering (luxury, business, casual, all)
- ✅ Price range filter (₮0 - ₮500,000)
- ✅ Sort options (popular, price, rating)
- ✅ Search integration
- ✅ Pagination (6 per page)
- ✅ Rating & review count display

### Booking Flow
- ✅ Date/time selection with duration display
- ✅ Guest count input (1-500)
- ✅ Event type selection
- ✅ Real-time price calculation
- ✅ Deposit calculation (30%)
- ✅ Confirmation modal before payment
- ✅ Status notifications

### Dashboards
- ✅ **Owner**: Hall management, earnings tracking, booking status
- ✅ **Admin**: System metrics, user verification, financial reports
- ✅ Both: Real-time statistics, action buttons, data tables

## 📱 Responsive Design

### Breakpoints
- **Desktop**: Full multi-column layouts (1200px+)
- **Tablet**: 2-column grids, adjusted sidebar (768px - 1199px)
- **Mobile**: 1-column stacked layouts (<768px)

### Mobile Features
- Collapsed sidebar in filters
- Touch-friendly button sizes (40px+ height)
- Optimized form layouts
- Hamburger menu placeholder
- Table overflow handling

## 🚀 Usage

### Installation
```bash
cd frontend
npm install
```

### Environment Variables
Create `.env` file:
```env
VITE_APP_API_URL=http://localhost:5000/api/v1
```

### Development
```bash
npm run dev
```

### Build Production
```bash
npm run build
npm run preview
```

## 📦 Dependencies

**Required packages** (add to package.json):
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

## 🎨 Styling Approach

### Inline CSS-in-JS
All components use inline `<style>` tags with CSS for:
- Easy component encapsulation
- No external CSS files needed
- Dynamic styling support
- Responsive media queries

### Global Styles
Base styles in [index.css](src/index.css):
- Font families & sizes
- Color variables
- Button styles
- Form inputs
- Scrollbar customization
- Utility classes

## 🔄 State Management

### Local State
- Form inputs via `useState`
- Component visibility (modals, menus)
- Filter & sort states
- Loading & error states

### Persistent State
- Authentication via localStorage
- User profile via TokenManager
- Tokens via apiClient interceptors

## 🧪 Mock Data

All pages use mock data for demonstration:
- 6 sample halls with details
- 3 sample bookings per user
- Statistics with realistic numbers
- Activity feed items
- Review data

**To integrate with backend API**: Replace mock `setTimeout` calls with `apiClient.get()` / `.post()` calls

## 📊 Analytics & Dashboards

### Admin Dashboard Metrics
- Total Users, Bookings, Revenue
- Platform Fee & Hall Count
- System status indicators
- Recent activity feed
- Verification queue
- Revenue breakdown chart

### Owner Dashboard Metrics
- Total Halls, Bookings, Earnings
- Monthly earnings highlight
- Hall occupancy rates
- Recent bookings list
- Quick action buttons

## 🔐 Security Features

- JWT token-based authentication
- Protected route guards
- Role-based access control (RBAC)
- Automatic token refresh
- Secure token storage (localStorage)
- Password input masking (in LoginPage)
- Email validation

## 🎯 Future Enhancements

- [ ] Real payment integration (Stripe, PayPal)
- [ ] Image upload with preview
- [ ] Real-time notifications
- [ ] Chat/messaging system
- [ ] Advanced analytics charts
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Mobile app version

## 📝 Component Props Reference

### ProtectedRoute
```javascript
<ProtectedRoute requiredRole={['admin', 'owner']}>
  <YourComponent />
</ProtectedRoute>
```

### Header
```javascript
<Header user={user} setUser={setUser} />
```

### Footer
```javascript
<Footer />
```

## 🐛 Common Issues & Solutions

### API Connection Error
- Check `REACT_APP_API_URL` environment variable
- Ensure backend server is running on `http://localhost:5000`
- Verify CORS configuration in backend

### Authentication Issues
- Clear browser localStorage
- Check token expiry settings
- Verify JWT_SECRET matches between frontend & backend

### Styling Not Applied
- Check CSS syntax in `<style>` tags
- Verify class names match between JSX and CSS
- Clear browser cache (Ctrl+Shift+Delete)

## 📖 Documentation Links

- [React Documentation](https://react.dev)
- [React Router v6](https://reactrouter.com/en/main)
- [Axios Documentation](https://axios-http.com)
- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

## 👥 User Roles

### Guest (Unauthenticated)
- Browse halls
- View details
- Access public pages

### User (Regular)
- Login/Register
- View profile
- Browse & book halls
- View own bookings
- Manage bookings

### Owner
- All User features
- Owner Dashboard access
- Manage halls
- View earnings & bookings
- Upload hall photos

### Admin
- All Owner features
- Admin Dashboard access
- System metrics
- User verification
- Financial reports
- Manage all content

---

**Created**: 2024
**Last Updated**: 2024
**Version**: 1.0.0
