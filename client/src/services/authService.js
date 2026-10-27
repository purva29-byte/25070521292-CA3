import { api } from './api.js';

export const authService = {
  async me() {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },
  async login(payload) {
    const response = await api.post('/auth/login', payload);
    return response.data.data.user;
  },
  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return response.data.data.user;
  },
  async logout() {
    await api.post('/auth/logout');
  },
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data.message;
  },
  async resetPassword(payload) {
    const response = await api.post('/auth/reset-password', payload);
    return response.data.message;
  },
};
