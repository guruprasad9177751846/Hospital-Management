import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout, ProtectedRoute } from './components/layout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Areas from './pages/Areas';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Reports from './pages/Reports';
import StaffRecords from './pages/StaffRecords';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-medical-teal flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <path d="M12 2v20M2 12h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-slate-500 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Accessible by both Admin and Staff */}
        <Route index element={<Dashboard />} />

        {/* Staff Records - Accessible by both Admin and Staff */}
        <Route path="records" element={<StaffRecords />} />

        {/* Admin Only Routes */}
        <Route
          path="areas"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Areas />
            </ProtectedRoute>
          }
        />
        <Route
          path="tasks"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all - Redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

