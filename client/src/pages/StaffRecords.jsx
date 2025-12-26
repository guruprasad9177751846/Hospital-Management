import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  HiOutlinePlus, 
  HiOutlinePencilSquare, 
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineFunnel,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineClipboardDocumentList
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { useStaffRecords, useCreateStaffRecord, useUpdateStaffRecord, useDeleteStaffRecord, useStaffRecordStats } from '../hooks/useStaffRecords';
import { useActiveAreas } from '../hooks/useAreas';
import { Button, Select, Modal, Input, Spinner, EmptyState } from '../components/common';

const CATEGORIES = [
  { value: 'observation', label: 'Observation' },
  { value: 'incident', label: 'Incident' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'general', label: 'General' },
  { value: 'patient_feedback', label: 'Patient Feedback' },
  { value: 'supply_request', label: 'Supply Request' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-purple-100 text-purple-700';
    case 'resolved': return 'bg-green-100 text-green-700';
    case 'closed': return 'bg-slate-100 text-slate-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const StaffRecords = () => {
  const { isAdmin, user } = useAuth();
  const [filters, setFilters] = useState({ category: '', status: '', priority: '', myRecords: false });
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    description: '',
    priority: 'medium',
    status: 'open',
    area: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  const queryParams = useMemo(() => ({
    page,
    limit: 10,
    ...(filters.category && { category: filters.category }),
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.myRecords && { myRecords: 'true' })
  }), [page, filters]);

  // Check if current user can edit/delete a record
  const canEditRecord = (record) => {
    return isAdmin || record.createdBy?._id === user?._id;
  };

  const { data, isLoading, error } = useStaffRecords(queryParams);
  const { data: stats } = useStaffRecordStats();
  const { data: areas } = useActiveAreas();
  const { mutate: createRecord, isPending: isCreating } = useCreateStaffRecord();
  const { mutate: updateRecord, isPending: isUpdating } = useUpdateStaffRecord();
  const { mutate: deleteRecord, isPending: isDeleting } = useDeleteStaffRecord();

  const areaOptions = useMemo(() => {
    if (!areas) return [];
    return areas.map(area => ({ value: area._id, label: area.name }));
  }, [areas]);

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'general',
      description: '',
      priority: 'medium',
      status: 'open',
      area: '',
      notes: ''
    });
    setErrors({});
    setSelectedRecord(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      title: record.title,
      category: record.category,
      description: record.description,
      priority: record.priority,
      status: record.status,
      area: record.area?._id || '',
      notes: record.notes || ''
    });
    setIsModalOpen(true);
  };

  const openViewModal = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      ...formData,
      area: formData.area || undefined
    };

    if (selectedRecord) {
      updateRecord({ id: selectedRecord._id, data: submitData }, {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
        }
      });
    } else {
      createRecord(submitData, {
        onSuccess: () => {
          setIsModalOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleDelete = () => {
    if (selectedRecord) {
      deleteRecord(selectedRecord._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setSelectedRecord(null);
        }
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800">
            Staff Records
          </h1>
          <p className="text-slate-500 mt-1">
            View all records • Create and manage your own observations, incidents, and requests
          </p>
        </div>

        <Button variant="primary" icon={HiOutlinePlus} onClick={openCreateModal}>
          New Record
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-slate-500">Open</p>
            <p className="text-2xl font-bold text-blue-600">{stats.byStatus?.open || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-purple-600">{stats.byStatus?.in_progress || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{stats.byStatus?.resolved || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Closed</p>
            <p className="text-2xl font-bold text-slate-600">{stats.byStatus?.closed || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <HiOutlineFunnel className="w-5 h-5 text-slate-400" />
          
          {/* My Records Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.myRecords}
              onChange={(e) => { setFilters(f => ({ ...f, myRecords: e.target.checked })); setPage(1); }}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-slate-700">My Records Only</span>
          </label>
          
          <div className="w-px h-6 bg-slate-200" />
          
          <Select
            value={filters.category}
            onChange={(e) => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
            options={CATEGORIES}
            placeholder="All Categories"
            className="min-w-[160px]"
          />
          <Select
            value={filters.status}
            onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
            options={STATUSES}
            placeholder="All Statuses"
            className="min-w-[140px]"
          />
          <Select
            value={filters.priority}
            onChange={(e) => { setFilters(f => ({ ...f, priority: e.target.value })); setPage(1); }}
            options={PRIORITIES}
            placeholder="All Priorities"
            className="min-w-[140px]"
          />
          {(filters.category || filters.status || filters.priority || filters.myRecords) && (
            <Button 
              variant="ghost" 
              size="small"
              onClick={() => { setFilters({ category: '', status: '', priority: '', myRecords: false }); setPage(1); }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Records List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="large" />
          </div>
        ) : error ? (
          <EmptyState
            title="Error loading records"
            description={error.message || "Something went wrong"}
          />
        ) : !data?.records?.length ? (
          <EmptyState
            icon={HiOutlineClipboardDocumentList}
            title="No records found"
            description="Create your first record to get started"
            action={
              <Button variant="primary" icon={HiOutlinePlus} onClick={openCreateModal}>
                Create Record
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Area</th>
                    <th>Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((record, index) => (
                    <tr key={record._id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                      <td>
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1">{record.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{record.description}</p>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm capitalize">{record.category.replace('_', ' ')}</span>
                      </td>
                      <td>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border capitalize ${getPriorityColor(record.priority)}`}>
                          {record.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(record.status)}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-slate-600">{record.createdBy?.name || '-'}</span>
                      </td>
                      <td>
                        <span className="text-sm text-slate-600">{record.area?.name || '-'}</span>
                      </td>
                      <td>
                        <span className="text-sm text-slate-500">
                          {format(new Date(record.createdAt), 'dd MMM yyyy')}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openViewModal(record)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </button>
                          {canEditRecord(record) && (
                            <>
                              <button
                                onClick={() => openEditModal(record)}
                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <HiOutlinePencilSquare className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(record)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <HiOutlineTrash className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} records)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={page >= data.pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={selectedRecord ? 'Edit Record' : 'Create New Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a brief title"
            error={errors.title}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input"
              >
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedRecord && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Area (Optional)</label>
            <select
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="input"
            >
              <option value="">Select an area</option>
              {areaOptions.map(area => (
                <option key={area.value} value={area.value}>{area.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide detailed description..."
              className="input resize-none"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {selectedRecord && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Additional notes..."
                className="input resize-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isCreating || isUpdating}>
              {selectedRecord ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedRecord(null); }}
        title="Record Details"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Title</p>
              <p className="font-medium text-slate-800">{selectedRecord.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Category</p>
                <p className="capitalize">{selectedRecord.category.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Priority</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border capitalize ${getPriorityColor(selectedRecord.priority)}`}>
                  {selectedRecord.priority}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(selectedRecord.status)}`}>
                  {selectedRecord.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Area</p>
                <p>{selectedRecord.area?.name || '-'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Description</p>
              <p className="text-slate-700 whitespace-pre-wrap">{selectedRecord.description}</p>
            </div>
            {selectedRecord.notes && (
              <div>
                <p className="text-sm text-slate-500">Notes</p>
                <p className="text-slate-700">{selectedRecord.notes}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-sm text-slate-500">Created By</p>
                <p className="text-sm">{selectedRecord.createdBy?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Created At</p>
                <p className="text-sm">{format(new Date(selectedRecord.createdAt), 'dd MMM yyyy, HH:mm')}</p>
              </div>
            </div>
            {selectedRecord.resolvedBy && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Resolved By</p>
                  <p className="text-sm">{selectedRecord.resolvedBy?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Resolved At</p>
                  <p className="text-sm">{format(new Date(selectedRecord.resolvedAt), 'dd MMM yyyy, HH:mm')}</p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              {canEditRecord(selectedRecord) && (
                <Button variant="secondary" onClick={() => { setIsViewModalOpen(false); openEditModal(selectedRecord); }}>
                  Edit
                </Button>
              )}
              <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedRecord(null); }}
        title="Delete Record"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <HiOutlineExclamationTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">
            Are you sure you want to delete this record?
          </h3>
          <p className="text-slate-500 mb-6">
            "{selectedRecord?.title}" will be permanently deleted. This action cannot be undone.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => { setIsDeleteModalOpen(false); setSelectedRecord(null); }}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              className="!bg-red-600 hover:!bg-red-700" 
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffRecords;

