import api from './api';

const staffRecordService = {
  getAll: async (params = {}) => {
    const response = await api.get('/staff-records', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/staff-records/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/staff-records/stats');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/staff-records', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/staff-records/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/staff-records/${id}`);
    return response.data;
  }
};

export default staffRecordService;

