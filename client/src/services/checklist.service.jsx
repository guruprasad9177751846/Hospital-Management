import api from './api';

const checklistService = {
  getByDate: async (date, areaId = null) => {
    const params = { date };
    if (areaId) params.areaId = areaId;
    const response = await api.get('/checklists', { params });
    return response.data;
  },

  updateEntry: async (taskId, data) => {
    const response = await api.put(`/checklists/entry/${taskId}`, data);
    return response.data;
  },

  saveChecklist: async (date, entries) => {
    const response = await api.post('/checklists/save', { date, entries });
    return response.data;
  },

  getStatistics: async (date) => {
    const response = await api.get('/checklists/statistics', { params: { date } });
    return response.data;
  },

  exportCSV: async (date, areaId = null) => {
    const params = { date };
    if (areaId) params.areaId = areaId;
    const response = await api.get('/checklists/export/csv', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  exportPDF: async (date, areaId = null) => {
    const params = { date };
    if (areaId) params.areaId = areaId;
    const response = await api.get('/checklists/export/pdf', {
      params,
      responseType: 'blob',
    });
    return response;
  },
};

export default checklistService;

