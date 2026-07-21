/** Single source of truth for system role display labels */
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  training_admin: 'Training Admin',
  content_manager: 'Content Manager',
  instructor: 'Instructor',
  org_admin: 'Organization Admin',
  learner: 'Learner',
};

/** Roles that MUST have an organization */
export const ORG_REQUIRED_ROLES: string[] = ['org_admin'];

/** All available status values for users */
export const USER_STATUSES = ['active', 'inactive'] as const;

/** Format a role ID into a display label */
export function formatRoleLabel(roleId: string): string {
  return ROLE_LABELS[roleId] || roleId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
