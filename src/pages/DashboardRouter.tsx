import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';

export default function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) return null;

  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  if (profile.role === 'manager') {
    return <Navigate to="/manager" replace />;
  }

  return <Navigate to="/staff" replace />;
}
