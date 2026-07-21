import type { Role } from '@/types';

/** Single source of truth for role display labels */
export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  training_admin: 'Training Admin',
  content_manager: 'Content Manager',
  instructor: 'Instructor',
  org_admin: 'Organization Admin',
  learner: 'Learner',
};

/** Roles that don't require an organization assignment */
export const PLATFORM_ROLES: Role[] = ['super_admin', 'training_admin', 'content_manager'];

/** Roles that MUST have an organization */
export const ORG_REQUIRED_ROLES: Role[] = ['org_admin'];

/** All available status values for users */
export const USER_STATUSES = ['active', 'inactive'] as const;
