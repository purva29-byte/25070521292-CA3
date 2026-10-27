import { api } from './api.js';

export const conversationService = {
  async list() {
    const response = await api.get('/conversations');
    return response.data.data.conversations;
  },
  async start(listingId) {
    const response = await api.post('/conversations', { listingId });
    return response.data.data.conversation;
  },
  async messages(id) {
    const response = await api.get(`/conversations/${id}/messages`);
    return response.data.data;
  },
  async send(id, text) {
    const response = await api.post(`/conversations/${id}/messages`, { text });
    return response.data.data.message;
  },
  async markRead(id) {
    const response = await api.patch(`/conversations/${id}/read`);
    return response.data.data;
  },
};
