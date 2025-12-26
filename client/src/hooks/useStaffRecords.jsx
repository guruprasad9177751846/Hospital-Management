import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import staffRecordService from '../services/staffRecord.service';
import toast from 'react-hot-toast';

export const useStaffRecords = (params = {}) => {
  return useQuery({
    queryKey: ['staff-records', params],
    queryFn: () => staffRecordService.getAll(params),
    select: (data) => data.data,
  });
};

export const useStaffRecord = (id) => {
  return useQuery({
    queryKey: ['staff-record', id],
    queryFn: () => staffRecordService.getById(id),
    enabled: !!id,
    select: (data) => data.data.record,
  });
};

export const useStaffRecordStats = () => {
  return useQuery({
    queryKey: ['staff-record-stats'],
    queryFn: () => staffRecordService.getStats(),
    select: (data) => data.data.stats,
  });
};

export const useCreateStaffRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => staffRecordService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-records'] });
      queryClient.invalidateQueries({ queryKey: ['staff-record-stats'] });
      toast.success('Record created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create record');
    },
  });
};

export const useUpdateStaffRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => staffRecordService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-records'] });
      queryClient.invalidateQueries({ queryKey: ['staff-record-stats'] });
      toast.success('Record updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update record');
    },
  });
};

export const useDeleteStaffRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => staffRecordService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-records'] });
      queryClient.invalidateQueries({ queryKey: ['staff-record-stats'] });
      toast.success('Record deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete record');
    },
  });
};

