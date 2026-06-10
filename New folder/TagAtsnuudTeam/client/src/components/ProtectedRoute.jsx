import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Protected Route Component
 * Day 3 - Checks if user is authenticated before allowing access
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');

  // No token - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists but user info missing - clear and redirect
  if (!userStr) {
    localStorage.removeItem('accessToken');
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (requiredRole) {
    try {
      const user = JSON.parse(userStr);
      const allowedRoles = requiredRole.map((role) => String(role).toLowerCase());
      const userRole = String(user.role || '').toLowerCase();
      if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }

  // Render protected component
  return children;
};

export default ProtectedRoute;
