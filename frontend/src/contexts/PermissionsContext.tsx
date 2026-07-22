import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Role } from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────
export type PermissionAction = 'read' | 'create' | 'edit' | 'delete';
export type PermissionSet = Record<PermissionAction, boolean>;
export type ModulePermissions = Record<string, PermissionSet>;
export type AllPermissions = Record<string, ModulePermissions>;

// ─── Module Registry ───────────────────────────────────────────────────────
// Single source of truth for all module names used across the platform
export const ALL_MODULES = [
  'Dashboard', 'Users', 'Courses', 'Programs', 'Content', 'Assessments',
  'Enrollments', 'Sessions', 'Instructors', 'Organizations', 'Payments',
  'Certificates', 'Reports', 'Inquiries', 'Notifications', 'Media Library',
  'My Learning', 'My Schedule', 'My Courses', 'My Certificates', 'My Assessments',
  'Settings', 'System Monitor', 'Roles',
] as const;

export type ModuleName = typeof ALL_MODULES[number];

// ─── Default Permissions (seed data) ───────────────────────────────────────
const EMPTY_PERM: PermissionSet = { read: false, create: false, edit: false, delete: false };
const FULL_PERM: PermissionSet = { read: true, create: true, edit: true, delete: true };

function buildPerms(readModules: string[], createModules: string[] = [], editModules: string[] = [], deleteModules: string[] = []): ModulePermissions {
  return Object.fromEntries(ALL_MODULES.map(m => [m, {
    read: readModules.includes(m),
    create: createModules.includes(m),
    edit: editModules.includes(m),
    delete: deleteModules.includes(m),
  }]));
}

const SEED_PERMISSIONS: AllPermissions = {
  super_admin: Object.fromEntries(ALL_MODULES.map(m => [m, FULL_PERM])),
  training_admin: buildPerms(
    ['Dashboard', 'Users', 'Courses', 'Programs', 'Assessments', 'Enrollments', 'Sessions', 'Instructors', 'Organizations', 'Payments', 'Certificates', 'Reports', 'Inquiries', 'Notifications', 'Settings'],
    ['Users', 'Courses', 'Programs', 'Assessments', 'Enrollments', 'Sessions', 'Instructors', 'Organizations', 'Certificates', 'Inquiries', 'Notifications'],
    ['Users', 'Courses', 'Programs', 'Assessments', 'Enrollments', 'Sessions', 'Instructors', 'Organizations', 'Certificates', 'Inquiries', 'Notifications', 'Settings'],
    ['Courses', 'Programs', 'Enrollments', 'Sessions', 'Notifications']
  ),
  content_manager: buildPerms(
    ['Dashboard', 'Courses', 'Programs', 'Content', 'Assessments', 'Media Library'],
    ['Courses', 'Programs', 'Content', 'Assessments', 'Media Library'],
    ['Courses', 'Programs', 'Content', 'Assessments', 'Media Library'],
    ['Content']
  ),
  instructor: buildPerms(
    ['Dashboard', 'Courses', 'Assessments', 'Sessions', 'My Courses', 'My Schedule'],
    [],
    ['Assessments'],
    []
  ),
  org_admin: buildPerms(
    ['Dashboard', 'Enrollments', 'Certificates', 'Reports'],
    ['Enrollments'],
    [],
    []
  ),
  learner: buildPerms(
    ['Dashboard', 'Courses', 'Programs', 'My Learning', 'My Schedule', 'My Certificates', 'My Assessments'],
    [],
    [],
    []
  ),
};

// ─── Storage Layer (replaceable with API later) ────────────────────────────
const STORAGE_KEY = 'dynamicti_permissions_v2';

function loadPermissions(): AllPermissions {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure — check if it uses 'read' key (not old 'view')
      const firstRole = Object.values(parsed)[0] as any;
      const firstModule = firstRole ? Object.values(firstRole)[0] as any : null;
      if (firstModule && 'read' in firstModule) return parsed;
    }
  } catch { /* ignore */ }
  // Clear any old format
  localStorage.removeItem('dynamicti_permissions');
  return SEED_PERMISSIONS;
}

function savePermissions(perms: AllPermissions): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
}

// ─── Context ───────────────────────────────────────────────────────────────
interface PermissionsContextType {
  permissions: AllPermissions;
  // Check if a role can access a module (has any permission)
  canAccess: (role: Role, module: string) => boolean;
  // Check specific action
  canPerform: (role: Role, module: string, action: PermissionAction) => boolean;
  // Get full permission set for a module
  getPermissions: (role: Role, module: string) => PermissionSet;
  // Update all permissions for a role and persist
  updateRolePermissions: (roleId: string, modulePerms: ModulePermissions) => void;
  // Delete a role entirely from permissions
  deleteRolePermissions: (roleId: string) => void;
  // Force refresh from storage (for when backend syncs)
  refreshPermissions: () => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<AllPermissions>(loadPermissions);

  // Sync to localStorage whenever permissions change
  useEffect(() => {
    savePermissions(permissions);
  }, [permissions]);

  const canAccess = useCallback((role: Role, module: string): boolean => {
    const modPerms = permissions[role]?.[module];
    if (!modPerms) return false;
    return modPerms.read || modPerms.create || modPerms.edit || modPerms.delete;
  }, [permissions]);

  const canPerform = useCallback((role: Role, module: string, action: PermissionAction): boolean => {
    return permissions[role]?.[module]?.[action] ?? false;
  }, [permissions]);

  const getPermissions = useCallback((role: Role, module: string): PermissionSet => {
    return permissions[role]?.[module] || { ...EMPTY_PERM };
  }, [permissions]);

  const updateRolePermissions = useCallback((roleId: string, modulePerms: ModulePermissions) => {
    setPermissions(prev => {
      const next = { ...prev, [roleId]: modulePerms };
      savePermissions(next);
      return next;
    });
  }, []);

  const deleteRolePermissions = useCallback((roleId: string) => {
    setPermissions(prev => {
      const next = { ...prev };
      delete next[roleId];
      savePermissions(next);
      return next;
    });
  }, []);

  const refreshPermissions = useCallback(() => {
    setPermissions(loadPermissions());
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, canAccess, canPerform, getPermissions, updateRolePermissions, deleteRolePermissions, refreshPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider');
  return ctx;
}
