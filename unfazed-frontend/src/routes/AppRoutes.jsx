import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/therapist/Dashboard';
import Schedule from '../pages/therapist/Schedule';
import Clients from '../pages/therapist/Clients';
import ClientProfile from '../pages/therapist/ClientProfile';
import Notes from '../pages/therapist/Notes';
import Packages from '../pages/therapist/Packages';
import Analytics from '../pages/therapist/Analytics';
import ProfileSettings from '../pages/therapist/ProfileSettings';
import Subscription from '../pages/therapist/Subscription';
import ClientPortal from '../pages/client/ClientPortal';
import BookingPage from '../pages/client/BookingPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import Loader from '../components/common/Loader';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <Loader text="Verifying session credentials..." />;
  if (!user) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Therapist Practice Hub Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
      <Route path="/dashboard/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/dashboard/clients/:id" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
      <Route path="/dashboard/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/dashboard/packages" element={<ProtectedRoute><Packages /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/dashboard/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
      <Route path="/dashboard/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />

      {/* Branded Client Portal & Telehealth Booking */}
      <Route path="/:slug" element={<ClientPortal />} />
      <Route path="/:slug/book" element={<BookingPage />} />
    </Routes>
  );
};

export default AppRoutes;
