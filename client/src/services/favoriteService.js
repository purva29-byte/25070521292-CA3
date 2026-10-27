import { api } from './api.js';

export const favoriteService = {
  async list() {
    const response = await api.get('/favorites');
    return response.data.data;
  },
  async add(listingId) {
    const response = await api.post(`/favorites/${listingId}`);
    return response.data.data;
  },
  async remove(listingId) {
    const response = await api.delete(`/favorites/${listingId}`);
    return response.data.data;
  },
};
