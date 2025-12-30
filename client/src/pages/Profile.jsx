import React, { useState, useEffect, useRef } from 'react';
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlinePhoto,
  HiOutlineBuildingOffice2,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineCamera
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { Button, Input, Spinner } from '../components/common';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
      setPreviewImage(user.profilePicture || null);
    }
  }, [user]);

  const validateProfile = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!passwordData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result;
      setPreviewImage(base64Image);
      
      // Upload immediately
      setIsUploadingPhoto(true);
      try {
        await authService.updateProfile({ profilePicture: base64Image });
        toast.success('Profile picture updated!');
        if (refreshUser) refreshUser();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to upload image');
        setPreviewImage(user?.profilePicture || null);
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setIsLoading(true);
    try {
      const updateData = {};
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.email !== user.email) updateData.email = formData.email;

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }

      await authService.updateProfile(updateData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      if (refreshUser) refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setErrors({});
  };

  const removeProfilePicture = async () => {
    setIsUploadingPhoto(true);
    try {
      await authService.updateProfile({ profilePicture: null });
      setPreviewImage(null);
      toast.success('Profile picture removed!');
      if (refreshUser) refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove image');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-800">
          My Profile
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your account settings and profile information
        </p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        {/* Avatar & Basic Info */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 pb-6 border-b border-slate-100">
          <div className="relative group">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            {/* Profile Picture */}
            <div className="relative">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt={user.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploadingPhoto ? (
                  <Spinner size="small" />
                ) : (
                  <HiOutlineCamera className="w-8 h-8 text-white" />
                )}
              </button>
            </div>

            {/* Photo actions */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="px-2 py-1 bg-white rounded-lg shadow-md text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >
                Upload
              </button>
              {previewImage && (
                <button
                  onClick={removeProfilePicture}
                  disabled={isUploadingPhoto}
                  className="px-2 py-1 bg-white rounded-lg shadow-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-slate-800">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role === 'admin' 
                  ? <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                  : <HiOutlineUser className="w-3.5 h-3.5" />
                }
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              {user.hospital && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                  <HiOutlineBuildingOffice2 className="w-3.5 h-3.5" />
                  {user.hospital.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Click on photo to change • Max 5MB
            </p>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
              error={errors.name}
              icon={HiOutlineUser}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              error={errors.email}
              icon={HiOutlineEnvelope}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={cancelEdit} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-slate-800 font-medium">{user.name}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-slate-800 font-medium">{user.email}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Role</p>
                <p className="text-slate-800 font-medium capitalize">{user.role}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Hospital</p>
                <p className="text-slate-800 font-medium">{user.hospital?.name || 'Not assigned'}</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => setIsEditing(true)}
              icon={HiOutlinePencilSquare}
              className="w-full sm:w-auto"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <HiOutlineLockClosed className="w-5 h-5 text-slate-400" />
          Change Password
        </h3>

        {isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Enter current password"
              error={passwordErrors.currentPassword}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Enter new password"
              error={passwordErrors.newPassword}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm new password"
              error={passwordErrors.confirmPassword}
            />
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                }} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isPasswordLoading} className="flex-1">
                Change Password
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-slate-500 text-sm mb-4">
              Keep your account secure by using a strong password.
            </p>
            <Button 
              variant="secondary" 
              onClick={() => setIsChangingPassword(true)}
              icon={HiOutlineLockClosed}
            >
              Change Password
            </Button>
          </div>
        )}
      </div>

      {/* Hospital Info Card (if assigned) */}
      {user.hospital && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <HiOutlineBuildingOffice2 className="w-5 h-5 text-slate-400" />
            My Hospital
          </h3>
          <div className="flex items-start gap-4">
            {user.hospital.logoUrl ? (
              <img 
                src={user.hospital.logoUrl} 
                alt={user.hospital.name}
                className="w-16 h-16 object-contain rounded-xl border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                <HiOutlineBuildingOffice2 className="w-8 h-8 text-slate-400" />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-slate-800">{user.hospital.name}</h4>
              <p className="text-sm text-slate-500 font-mono">{user.hospital.code}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Icon component
const HiOutlinePencilSquare = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

export default Profile;
