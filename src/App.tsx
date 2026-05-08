import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';
import StaffDashboard from './pages/staff/StaffDashboard';
import ReportForm from './pages/staff/ReportForm';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DivisionManagement from './pages/admin/DivisionManagement';
import ReviewReport from './pages/manager/ReviewReport';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen w-screen items-center justify-center bg-[#F8F9FA]">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardRouter />} />
            
            {/* Staff Routes */}
            <Route path="staff" element={<ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}><StaffDashboard /></ProtectedRoute>} />
            <Route path="staff/report/new" element={<ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}><ReportForm /></ProtectedRoute>} />
            <Route path="staff/report/:id" element={<ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}><ReportForm /></ProtectedRoute>} />
            
            {/* Manager Routes */}
            <Route path="manager" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><ManagerDashboard /></ProtectedRoute>} />
            <Route path="manager/review/:id" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><ReviewReport /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="admin/divisions" element={<ProtectedRoute allowedRoles={['admin']}><DivisionManagement /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
