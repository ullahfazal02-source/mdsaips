import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * Protected Route Component with Role-Based Access Control
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children Child route element to render
 * @param {Array<string>} [props.allowedRoles] Allowed roles (e.g. ['vendor', 'admin'])
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated, role, loading, user } = useSelector((state) => state.auth);

  // Loading indicator during rehydration / auth check
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Verifying security session...</p>
      </div>
    );
  }

  // Redirect to login if user is unauthenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect user to their designated dashboard based on their actual role
    let fallbackPath = '/';
    if (role === 'customer') fallbackPath = '/customer-dashboard';
    else if (role === 'vendor') fallbackPath = '/vendor-dashboard';
    else if (role === 'admin') fallbackPath = '/admin-dashboard';

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
