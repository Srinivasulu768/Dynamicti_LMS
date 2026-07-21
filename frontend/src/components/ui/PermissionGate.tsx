import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, type PermissionAction } from '@/contexts/PermissionsContext';

interface PermissionGateProps {
  module: string;
  action: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's permission
 * for a given module and action.
 *
 * Usage:
 *   <PermissionGate module="Users" action="create">
 *     <Button>Add User</Button>
 *   </PermissionGate>
 */
export function PermissionGate({ module, action, children, fallback = null }: PermissionGateProps) {
  const { user } = useAuth();
  const { canPerform } = usePermissions();

  if (!user) return null;
  if (!canPerform(user.role, module, action)) return <>{fallback}</>;
  return <>{children}</>;
}
