import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Services from '@/pages/Services';
import VendorDashboard from '@/pages/VendorDashboard';
import CustomerDashboard from '@/pages/CustomerDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import AIPlanner from '@/pages/AIPlanner';
import Booking from '@/pages/Booking';
import Profile from '@/pages/Profile';

/**
 * React Router v7 / v6 Routing Architecture
 * Defines all 10 application routes wrapped inside MainLayout shell.
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
          <Route path="services" element={<Services />} />
          <Route path="ai-planner" element={<AIPlanner />} />
          <Route path="booking" element={<Booking />} />
          <Route path="profile" element={<Profile />} />

          {/* Role-Based Dashboard Routes */}
          <Route path="vendor-dashboard" element={<VendorDashboard />} />
          <Route path="customer-dashboard" element={<CustomerDashboard />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />

          {/* Catch-all fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
