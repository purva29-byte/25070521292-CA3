import { api } from './api.js';

export const adminService = {
  async stats() {
    const response = await api.get('/admin/stats');
    return response.data.data;
  },
  async listings(params = {}) {
    const response = await api.get('/admin/listings', { params });
    return { listings: response.data.data.listings, meta: response.data.meta };
  },
  async moderate(id, payload) {
    const response = await api.patch(`/admin/listings/${id}/moderate`, payload);
    return response.data;
  },
  async reports(params = {}) {
    const response = await api.get('/admin/reports', { params });
    return { reports: response.data.data.reports, meta: response.data.meta };
  },
  async reviewReport(id, payload) {
    const response = await api.patch(`/admin/reports/${id}`, payload);
    return response.data;
  },
  async users(params = {}) {
    const response = await api.get('/admin/users', { params });
    return { users: response.data.data.users, meta: response.data.meta };
  },
  async updateUserStatus(id, payload) {
    const response = await api.patch(`/admin/users/${id}/status`, payload);
    return response.data;
  },
  async logs(params = {}) {
    const response = await api.get('/admin/moderation-logs', { params });
    return { logs: response.data.data.logs, meta: response.data.meta };
  },
};
