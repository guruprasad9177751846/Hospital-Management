import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areaService } from '../services';
import toast from 'react-hot-toast';

export const useAreas = (params = {}) => {
  return useQuery({
    queryKey: ['areas', params],
    queryFn: () => areaService.getAll(params),
    select: (data) => data.data,
  });
};

export const useActiveAreas = (hospitalId = null) => {
  return useQuery({
    queryKey: ['areas', 'active', hospitalId],
    queryFn: () => areaService.getActive(hospitalId),
    select: (data) => data.data.areas,
  });
};

export const useArea = (id) => {
  return useQuery({
    queryKey: ['areas', id],
    queryFn: () => areaService.getById(id),
    enabled: !!id,
    select: (data) => data.data.area,
  });
};

export const useCreateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => areaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Area created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create area');
    },
  });
};

export const useUpdateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => areaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Area updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update area');
    },
  });
};

export const useDeleteArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => areaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Area deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete area');
    },
  });
};

export const useToggleAreaStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => areaService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      toast.success('Area status updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update area status');
    },
  });
};
