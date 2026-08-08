import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

/**
 * Main App Layout Wrapper
 * Renders sticky Navbar, routed page content via Outlet, Footer, and global React Hot Toast notifications.
 */
export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Toast Notification Provider */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
          },
        }}
      />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
