import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Module name from permissions system — if provided, checks canAccess */
  module?: string;
}

export function ProtectedRoute({ children, module }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const { canAccess } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If module is specified, check permission-based access
  if (module && user && !canAccess(user.role, module)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
