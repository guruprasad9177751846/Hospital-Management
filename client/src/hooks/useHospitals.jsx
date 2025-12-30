import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hospitalService } from '../services';
import toast from 'react-hot-toast';

const HOSPITALS_KEY = 'hospitals';

export const useHospitals = (params = {}) => {
  return useQuery({
    queryKey: [HOSPITALS_KEY, params],
    queryFn: () => hospitalService.getAll(params),
    select: (data) => data.data
  });
};

export const useActiveHospitals = () => {
  return useQuery({
    queryKey: [HOSPITALS_KEY, 'active'],
    queryFn: () => hospitalService.getActive(),
    select: (data) => data.data?.hospitals || []
  });
};

export const useHospitalById = (id) => {
  return useQuery({
    queryKey: [HOSPITALS_KEY, id],
    queryFn: () => hospitalService.getById(id),
    enabled: !!id,
    select: (data) => data.data?.hospital
  });
};

export const useHospitalBranding = (id) => {
  return useQuery({
    queryKey: [HOSPITALS_KEY, id, 'branding'],
    queryFn: () => hospitalService.getBranding(id),
    enabled: !!id,
    select: (data) => data.data?.branding
  });
};

export const useCreateHospital = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hospitalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSPITALS_KEY] });
      toast.success('Hospital created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create hospital');
    }
  });
};

export const useUpdateHospital = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => hospitalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSPITALS_KEY] });
      toast.success('Hospital updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update hospital');
    }
  });
};

export const useDeleteHospital = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hospitalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSPITALS_KEY] });
      toast.success('Hospital deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete hospital');
    }
  });
};

export const useToggleHospitalStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hospitalService.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSPITALS_KEY] });
      toast.success('Hospital status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });
};

export const useSetDefaultHospital = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hospitalService.setDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSPITALS_KEY] });
      toast.success('Default hospital updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to set default');
    }
  });
};

export const useUploadHospitalLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, logoUrl }) => hospitalService.uploadLogo(id, logoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HOSPITALS_KEY] });
      toast.success('Logo updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update logo');
    }
  });
};
