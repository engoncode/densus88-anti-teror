// src/routes/components/protected-route.tsx
import { Navigate } from 'react-router-dom';

import { useAuth } from 'src/contexts/AuthContext';

// ----------------------------------------------------------------------

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: ('Super Admin' | 'Analyst' | 'Operator')[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check if user has valid role (allow Super Admin, Analyst, or Operator)
  if (!user?.role) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check specific role restrictions if provided
  if (allowedRoles && user?.role) {
    if (!allowedRoles.includes(user.role.name as 'Super Admin' | 'Analyst' | 'Operator')) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
