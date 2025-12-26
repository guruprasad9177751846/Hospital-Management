import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistService } from '../services';
import toast from 'react-hot-toast';

export const useChecklist = (date, areaId = null) => {
  return useQuery({
    queryKey: ['checklist', date, areaId],
    queryFn: () => checklistService.getByDate(date, areaId),
    enabled: !!date,
    select: (data) => data.data.checklist,
  });
};

export const useChecklistStatistics = (date) => {
  return useQuery({
    queryKey: ['checklist-stats', date],
    queryFn: () => checklistService.getStatistics(date),
    enabled: !!date,
    select: (data) => data.data.statistics,
  });
};

export const useUpdateEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }) => checklistService.updateEntry(taskId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-stats'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update entry');
    },
  });
};

export const useSaveChecklist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, entries }) => checklistService.saveChecklist(date, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-stats'] });
      toast.success('Checklist saved successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save checklist');
    },
  });
};

export const useExportChecklist = () => {
  const exportCSV = async (date, areaId = null) => {
    try {
      const response = await checklistService.exportCSV(date, areaId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `checklist_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully!');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to export CSV');
      }
    }
  };

  const exportPDF = async (date, areaId = null) => {
    try {
      const response = await checklistService.exportPDF(date, areaId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `checklist_${date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exported successfully!');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to export PDF');
      }
    }
  };

  return { exportCSV, exportPDF };
};

