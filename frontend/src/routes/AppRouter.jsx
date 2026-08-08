import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import VerifyOtp from '@/pages/VerifyOtp';
import Services from '@/pages/Services';
import VendorDashboard from '@/pages/VendorDashboard';
import CustomerDashboard from '@/pages/CustomerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AIPlanner from '@/pages/AIPlanner';
import Booking from '@/pages/Booking';
import Profile from '@/pages/Profile';

/**
 * React Router Application Architecture
 * Configures public, feature, and role-protected routes wrapped in MainLayout shell.
 */
export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public & Feature Routes */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-otp" element={<VerifyOtp />} />
          <Route path="services" element={<Services />} />
          <Route path="ai-planner" element={<AIPlanner />} />

          {/* Protected Routes */}
          <Route
            path="booking"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Role-Based Dashboard Protected Routes */}
          <Route
            path="customer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="vendor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
