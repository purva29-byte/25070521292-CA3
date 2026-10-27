import { api } from './api.js';

export const reportService = {
  async submit(payload) {
    const response = await api.post('/reports', payload);
    return response.data;
  },
};
