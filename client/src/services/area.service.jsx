import api from './api';

const areaService = {
  getAll: async (params = {}) => {
    const response = await api.get('/areas', { params });
    return response.data;
  },

  getActive: async (hospitalId = null) => {
    const params = {};
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/areas/active', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/areas/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/areas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/areas/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/areas/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/areas/${id}/toggle-status`);
    return response.data;
  }
};

export default areaService;
