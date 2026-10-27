import { api } from './api.js';

function toParams(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) return;
    if (Array.isArray(value)) {
      if (value.length) params[key] = value.join(',');
      return;
    }
    params[key] = value;
  });
  return params;
}

export const listingService = {
  async list(filters) {
    const response = await api.get('/listings', { params: toParams(filters) });
    return { listings: response.data.data.listings, meta: response.data.meta };
  },
  async featured(limit = 3) {
    const response = await api.get('/listings/featured', { params: { limit } });
    return response.data.data.listings;
  },
  async categories() {
    const response = await api.get('/listings/categories');
    return response.data.data.categories;
  },
  async get(id) {
    const response = await api.get(`/listings/${id}`);
    return response.data.data.listing;
  },
  async mine() {
    const response = await api.get('/listings/mine');
    return response.data.data;
  },
  async create(formData) {
    const response = await api.post('/listings', formData);
    return response.data.data.listing;
  },
  async update(id, formData) {
    const response = await api.patch(`/listings/${id}`, formData);
    return { listing: response.data.data.listing, message: response.data.message };
  },
  async remove(id) {
    await api.delete(`/listings/${id}`);
  },
  async updateStatus(id, status) {
    const response = await api.patch(`/listings/${id}/status`, { status });
    return { listing: response.data.data.listing, message: response.data.message };
  },
};
