import React, { useState } from 'react';
import { 
  HiOutlinePlus, 
  HiOutlinePencilSquare, 
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin
} from 'react-icons/hi2';
import { useAreas, useCreateArea, useUpdateArea, useDeleteArea, useToggleAreaStatus } from '../hooks/useAreas';
import { Button, Input, Modal, Spinner, EmptyState, Toggle } from '../components/common';
import toast from 'react-hot-toast';

const AreaForm = ({ area, onSubmit, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: area?.name || '',
    code: area?.code || '',
    description: area?.description || ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Area name is required';
    if (!formData.code.trim()) newErrors.code = 'Area code is required';
    if (formData.code.length > 10) newErrors.code = 'Code cannot exceed 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Area Name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="e.g., Consultation Chambers"
        error={errors.name}
      />
      <Input
        label="Area Code"
        value={formData.code}
        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
        placeholder="e.g., CC"
        error={errors.code}
        maxLength={10}
      />
      <div className="space-y-1">
        <label className="label">Description (Optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the area..."
          rows={3}
          className="input resize-none"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
          {area ? 'Update Area' : 'Create Area'}
        </Button>
      </div>
    </form>
  );
};

const Areas = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading, error } = useAreas({ search });
  const { mutate: createArea, isPending: isCreating } = useCreateArea();
  const { mutate: updateArea, isPending: isUpdating } = useUpdateArea();
  const { mutate: deleteArea, isPending: isDeleting } = useDeleteArea();
  const { mutate: toggleStatus } = useToggleAreaStatus();

  const handleCreate = (data) => {
    createArea(data, {
      onSuccess: () => {
        setIsModalOpen(false);
      }
    });
  };

  const handleUpdate = (data) => {
    updateArea(
      { id: selectedArea._id, data },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedArea(null);
        }
      }
    );
  };

  const handleDelete = () => {
    deleteArea(deleteConfirm._id, {
      onSuccess: () => {
        setDeleteConfirm(null);
      }
    });
  };

  const openEditModal = (area) => {
    setSelectedArea(area);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArea(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800">
            Areas Management
          </h1>
          <p className="text-slate-500 mt-1">
            Configure areas for task organization
          </p>
        </div>
        <Button
          variant="primary"
          icon={HiOutlinePlus}
          onClick={() => setIsModalOpen(true)}
        >
          Add Area
        </Button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <Input
          placeholder="Search areas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={HiOutlineMagnifyingGlass}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="large" />
          </div>
        ) : error ? (
          <EmptyState
            title="Error loading areas"
            description="Something went wrong. Please try again."
          />
        ) : !data?.areas || data.areas.length === 0 ? (
          <EmptyState
            icon={HiOutlineMapPin}
            title="No areas found"
            description="Create your first area to start organizing tasks."
            action={
              <Button variant="primary" icon={HiOutlinePlus} onClick={() => setIsModalOpen(true)}>
                Add Area
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th className="text-center">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.areas.map((area) => (
                  <tr key={area._id}>
                    <td>
                      <span className="font-mono text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {area.code}
                      </span>
                    </td>
                    <td className="font-medium text-slate-800">{area.name}</td>
                    <td className="text-sm text-slate-600 max-w-xs truncate">
                      {area.description || '-'}
                    </td>
                    <td>
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleStatus(area._id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            area.isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {area.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(area)}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <HiOutlinePencilSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(area)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedArea ? 'Edit Area' : 'Create Area'}
      >
        <AreaForm
          area={selectedArea}
          onSubmit={selectedArea ? handleUpdate : handleCreate}
          onClose={closeModal}
          isLoading={isCreating || isUpdating}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Area"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Areas;

