/**
 * Token Management Utilities
 * Day 3 - Auth token storage and retrieval
 */

const TokenManager = {
  /**
   * Set tokens
   */
  setTokens(accessToken, refreshToken = null) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  /**
   * Get access token
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Clear tokens
   */
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Check if token exists and is valid
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  },

  /**
   * Set user info
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Get user info
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Failed to parse user:', error);
      return null;
    }
  },

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  },

  /**
   * Check if user has any of the roles
   */
  hasAnyRole(roles) {
    const user = this.getUser();
    return user && roles.includes(user.role);
  }
};

export default TokenManager;
