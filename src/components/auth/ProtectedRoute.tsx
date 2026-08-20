import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
          <span>Loading Kelnix AI secure session...</span>
        </div>
      </div>
    );
  }

  // If Supabase is not configured, allow local developer fallback access with a non-blocking banner
  if (!isConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return null;
  }

  if (isConfigured && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
