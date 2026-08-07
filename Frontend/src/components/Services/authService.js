import client from './client';

export const authService = {
  // Login - Server sets HTTP-Only cookies in response headers
  login(credentials) {
    return client.post('/auth/login', credentials);
  },

  // Logout - Server clears HTTP-Only cookies
  logout() {
    return client.post('/auth/logout');
  },

  // Refresh active session cookies
  refreshToken(options = {}) {
    return client.post('/auth/refresh', {}, options);
  },

  // Fetch session state (works in both SSR and Client)
  getCurrentUser(options = {}) {
    return client.get('/auth/me', options);
  },
};