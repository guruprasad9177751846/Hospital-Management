import api from './api';

const hospitalService = {
  getAll: async (params = {}) => {
    const response = await api.get('/hospitals', { params });
    return response.data;
  },

  getActive: async () => {
    const response = await api.get('/hospitals/active');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/hospitals/${id}`);
    return response.data;
  },

  getBranding: async (hospitalId = null) => {
    const params = hospitalId ? { hospitalId } : {};
    const response = await api.get('/hospitals/branding', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/hospitals', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/hospitals/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/hospitals/${id}`);
    return response.data;
  },

  setDefault: async (id) => {
    const response = await api.patch(`/hospitals/${id}/set-default`);
    return response.data;
  },

  uploadLogo: async (id, logoUrl) => {
    // Use POST to match backend route
    const response = await api.post(`/hospitals/${id}/logo`, { logoUrl });
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/hospitals/${id}/toggle-status`);
    return response.data;
  }
};

export default hospitalService;
