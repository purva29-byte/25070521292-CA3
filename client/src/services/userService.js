import { api } from './api.js';

export const userService = {
  async profile(id) {
    const response = await api.get(`/users/${id}`);
    return response.data.data.user;
  },
  async updateMe(payload) {
    const response = await api.patch('/users/me', payload);
    return response.data.data.user;
  },
};
