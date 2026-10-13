import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50/40">
        <LoadingSpinner size="lg" label="Authenticating PinkSync..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-sm mt-8 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center font-bold text-lg mb-3">
          !
        </div>
        <h3 className="text-lg font-bold text-slate-800">Access Restricted</h3>
        <p className="mt-2 text-sm text-slate-500">
          Your current role (<span className="font-semibold text-rose-600">{user.role}</span>) does
          not have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
