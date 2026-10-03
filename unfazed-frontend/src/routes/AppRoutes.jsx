import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/therapist/Dashboard';
import Schedule from '../pages/therapist/Schedule';
import Clients from '../pages/therapist/Clients';
import ClientProfile from '../pages/therapist/ClientProfile';
import Notes from '../pages/therapist/Notes';
import Analytics from '../pages/therapist/Analytics';
import ClientPortal from '../pages/client/ClientPortal';
import BookingPage from '../pages/client/BookingPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
      <Route path="/dashboard/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/dashboard/clients/:id" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
      <Route path="/dashboard/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/:slug" element={<ClientPortal />} />
      <Route path="/:slug/book" element={<BookingPage />} />
    </Routes>
  );
};

export default AppRoutes;
