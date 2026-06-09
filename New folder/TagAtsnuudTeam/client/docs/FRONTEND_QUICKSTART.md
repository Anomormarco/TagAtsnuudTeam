# Frontend Quick Start Guide

## 🚀 Getting Started with HallBook Frontend

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Code editor (VS Code recommended)

---

## 📦 Installation

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

If you need to add missing packages:
```bash
npm install react-router-dom axios
```

### 3. Create environment file
```bash
cp .env.example .env
```

### 4. Update .env (if needed)
```env
VITE_APP_API_URL=http://localhost:5000/api/v1
```

---

## 🎯 Running the Application

### Development Mode
```bash
npm run dev
```
Opens at: `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.jsx       # Top navigation
│   │   └── Footer.jsx       # Footer
│   ├── pages/               # Full pages/routes
│   │   ├── HomePage.jsx
│   │   ├── HallDetailPage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── MyBookingsPage.jsx
│   │   ├── OwnerDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── NotFoundPage.jsx
│   ├── utils/               # Utilities
│   │   ├── apiClient.js     # Axios instance
│   │   └── tokenManager.js  # Auth tokens
│   ├── App.jsx              # Main router
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── .env.example             # Env template
├── package.json             # Dependencies
└── vite.config.js          # Vite config
```

---

## 🧪 Testing the Application

### Navigate Through Pages

1. **Home Page** (Public)
   - URL: `http://localhost:5173/`
   - Features: Hall grid, filters, search

2. **Hall Detail** (Public)
   - URL: `http://localhost:5173/halls/1`
   - Features: Details, amenities, reviews, book button

3. **Login** (Public)
   - URL: `http://localhost:5173/login`
   - Test: Use existing credentials

4. **Register** (Public)
   - URL: `http://localhost:5173/register`
   - Test: Create new account

5. **My Bookings** (Protected)
   - URL: `http://localhost:5173/bookings`
   - Note: Requires login

6. **Owner Dashboard** (Protected - Owner/Admin)
   - URL: `http://localhost:5173/owner/dashboard`
   - Note: Requires owner or admin role

7. **Admin Dashboard** (Protected - Admin Only)
   - URL: `http://localhost:5173/admin/dashboard`
   - Note: Requires admin role

8. **404 Error**
   - URL: `http://localhost:5173/invalid-page`
   - Shows: Not found page

---

## 🔐 Authentication Testing

### Login with Test Account
1. Navigate to `/login`
2. Enter email and password
3. Tokens stored in localStorage
4. Redirected to homepage
5. Access protected routes

### Register New Account
1. Navigate to `/register`
2. Fill in name, email, password
3. Submit to create account
4. Automatically logged in
5. Tokens stored

### Logout
1. Click user menu (top right)
2. Click "Logout"
3. Tokens cleared from localStorage
4. Redirected to login page

---

## 🐛 Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Kill the process using port 5173
# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :5173
kill -9 <PID>
```

### Issue: API Connection Error
- Check backend is running on `http://localhost:5000`
- Verify CORS is enabled in backend
- Check `.env` file has correct API URL

### Issue: Styling Not Applied
- Clear browser cache (Ctrl+Shift+Del)
- Hard refresh (Ctrl+Shift+R)
- Check browser console for CSS errors

### Issue: Components Not Rendering
- Check if file path is correct
- Verify component export/import
- Look for console errors

### Issue: Protected Routes Not Working
- Ensure you're logged in
- Check localStorage has tokens
- Verify correct role for route

---

## 📝 Development Tips

### Hot Module Replacement (HMR)
- Vite automatically reloads on file save
- No need to manually refresh

### React DevTools
- Install Chrome extension: "React Developer Tools"
- Debug component props and state

### Network Tab
- Open DevTools → Network tab
- Monitor API calls to backend
- Check request/response data

### Console Logs
- Use `console.log()` to debug
- Check for JavaScript errors
- Monitor API errors

---

## 🔄 Integration with Backend

### Mock Data → Real API

Replace mock setTimeout with API calls:

**Current (Mock):**
```javascript
useEffect(() => {
  setTimeout(() => {
    const mockHalls = [...];
    setHalls(mockHalls);
    setLoading(false);
  }, 300);
}, []);
```

**Replace with (Real API):**
```javascript
useEffect(() => {
  const fetchHalls = async () => {
    try {
      const response = await apiClient.get('/halls');
      setHalls(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  fetchHalls();
}, []);
```

---

## 📊 Available API Endpoints

### Authentication (Member 1 - Completed)
- `POST /auth/register` - Create account
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh-token` - Refresh token
- `GET /auth/me` - Get current user

### Halls (Member 2 - To Implement)
- `GET /halls` - List all halls
- `GET /halls/:id` - Get hall details
- `GET /halls/:id/available-times` - Get availability

### Bookings (Member 3 - To Implement)
- `POST /bookings` - Create booking
- `GET /bookings` - List user bookings
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Reviews (Member 3 - To Implement)
- `POST /halls/:id/reviews` - Add review
- `GET /halls/:id/reviews` - Get reviews

### Payments (Member 4 - To Implement)
- `POST /payments` - Process payment
- `GET /payments/:id` - Get payment status

---

## 🎨 Customization

### Change Primary Color
Edit in each component's `<style>` section:
```css
/* Change from #667eea to your color */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Update Logo Text
In `Header.jsx`:
```javascript
<span className="logo-text">YourBrandName</span>
```

### Add New Pages
1. Create file in `src/pages/YourPage.jsx`
2. Import in `App.jsx`
3. Add route to router
4. Add navigation link if needed

### Modify Theme
1. Edit colors in `index.css`
2. Update component gradients
3. Update button colors
4. Update hover effects

---

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [Vite Documentation](https://vitejs.dev)
- [CSS Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [JavaScript Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

---

## ✨ Next Steps

1. **Connect to Backend**
   - Replace mock data with API calls
   - Implement error handling
   - Add loading states

2. **Add Features**
   - Payment integration
   - Image uploads
   - Real-time notifications
   - Chat system

3. **Optimize Performance**
   - Code splitting
   - Image lazy loading
   - Caching strategies
   - Lighthouse audit

4. **Security**
   - Input validation
   - XSS protection
   - CSRF tokens
   - Rate limiting

5. **Testing**
   - Unit tests (Jest)
   - Component tests (React Testing Library)
   - E2E tests (Cypress)

---

## 📞 Support

If you encounter issues:

1. Check error message in console
2. Review relevant documentation
3. Check `.env` configuration
4. Verify backend is running
5. Clear cache and restart dev server

---

**Last Updated**: 2024
**Frontend Version**: 1.0.0
**Status**: Ready for Development
