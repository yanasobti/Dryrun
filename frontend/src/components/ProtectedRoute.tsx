import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        {/* Elegant loading spinner matching design aesthetics */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-650 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest animate-pulse font-mono">
          Loading Session...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
