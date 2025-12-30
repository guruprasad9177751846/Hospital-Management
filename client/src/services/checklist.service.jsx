import api from './api';

const checklistService = {
  getByDate: async (date, areaId = null, hospitalId = null) => {
    const params = { date };
    if (areaId) params.areaId = areaId;
    if (hospitalId) params.hospitalId = hospitalId;
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

  getStatistics: async (date, hospitalId = null) => {
    const params = { date };
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/checklists/statistics', { params });
    return response.data;
  },

  exportCSV: async (date, areaId = null, hospitalId = null) => {
    const params = { date };
    if (areaId) params.areaId = areaId;
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/checklists/export/csv', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  exportPDF: async (date, areaId = null, hospitalId = null) => {
    const params = { date };
    if (areaId) params.areaId = areaId;
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/checklists/export/pdf', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  exportDOCX: async (date, areaId = null, hospitalId = null) => {
    const params = { date };
    if (areaId) params.areaId = areaId;
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/checklists/export/docx', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  // Date range exports
  exportRangeCSV: async (startDate, endDate, areaId = null, hospitalId = null) => {
    const params = { startDate, endDate };
    if (areaId) params.areaId = areaId;
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/checklists/export/range/csv', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  exportRangePDF: async (startDate, endDate, areaId = null, hospitalId = null) => {
    const params = { startDate, endDate };
    if (areaId) params.areaId = areaId;
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/checklists/export/range/pdf', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  exportRangeDOCX: async (startDate, endDate, areaId = null, hospitalId = null) => {
    const params = { startDate, endDate };
    if (areaId) params.areaId = areaId;
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/checklists/export/range/docx', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  // Get reports by createdAt date range
  getReportsByDateRange: async (startDate, endDate, areaId = null, hospitalId = null) => {
    const params = { startDate, endDate };
    if (areaId) params.areaId = areaId;
    if (hospitalId) params.hospitalId = hospitalId;
    const response = await api.get('/checklists/reports', { params });
    return response.data;
  },
};

export default checklistService;

