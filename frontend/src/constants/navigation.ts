import type { Role } from '@/types';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: Role[];
  children?: NavItem[];
}

export const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', roles: ['super_admin', 'training_admin', 'content_manager', 'instructor', 'org_admin', 'learner'] },
  { id: 'users', label: 'Users', icon: 'Users', path: '/users', roles: ['super_admin', 'training_admin'] },
  { id: 'roles', label: 'Roles & Permissions', icon: 'Shield', path: '/roles', roles: ['super_admin'] },
  { id: 'courses', label: 'Courses', icon: 'BookOpen', path: '/courses', roles: ['super_admin', 'training_admin', 'content_manager', 'instructor'] },
  { id: 'programs', label: 'Programs', icon: 'GraduationCap', path: '/programs', roles: ['super_admin', 'training_admin', 'content_manager'] },
  { id: 'content', label: 'Content', icon: 'FileText', path: '/content', roles: ['super_admin', 'content_manager'] },
  { id: 'assessments', label: 'Assessments', icon: 'ClipboardCheck', path: '/assessments', roles: ['super_admin', 'training_admin', 'content_manager', 'instructor'] },
  { id: 'enrollments', label: 'Enrollments', icon: 'UserPlus', path: '/enrollments', roles: ['super_admin', 'training_admin', 'org_admin'] },
  { id: 'sessions', label: 'Sessions', icon: 'Calendar', path: '/sessions', roles: ['super_admin', 'training_admin', 'instructor'] },
  { id: 'instructors', label: 'Instructors', icon: 'GraduationCap', path: '/instructors', roles: ['super_admin', 'training_admin'] },
  { id: 'organizations', label: 'Organizations', icon: 'Building2', path: '/organizations', roles: ['super_admin', 'training_admin'] },
  { id: 'payments', label: 'Payments', icon: 'CreditCard', path: '/payments', roles: ['super_admin', 'training_admin'] },
  { id: 'certificates', label: 'Certificates', icon: 'Award', path: '/certificates', roles: ['super_admin', 'training_admin', 'org_admin'] },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports', roles: ['super_admin', 'training_admin', 'org_admin'] },
  { id: 'inquiries', label: 'Inquiries', icon: 'MessageSquare', path: '/inquiries', roles: ['super_admin', 'training_admin'] },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', path: '/notifications', roles: ['super_admin', 'training_admin'] },
  { id: 'media-library', label: 'Media Library', icon: 'Video', path: '/media-library', roles: ['super_admin', 'content_manager'] },
  { id: 'my-learning', label: 'My Learning', icon: 'BookMarked', path: '/my-learning', roles: ['learner'] },
  { id: 'my-schedule', label: 'My Schedule', icon: 'CalendarDays', path: '/my-schedule', roles: ['learner', 'instructor'] },
  { id: 'my-courses', label: 'My Courses', icon: 'BookOpen', path: '/my-courses', roles: ['instructor'] },
  { id: 'my-certificates', label: 'My Certificates', icon: 'Award', path: '/my-certificates', roles: ['learner'] },
  { id: 'my-assessments', label: 'My Assessments', icon: 'ClipboardCheck', path: '/my-assessments', roles: ['learner'] },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings', roles: ['super_admin', 'training_admin'] },
  { id: 'system-monitor', label: 'System Monitor', icon: 'Activity', path: '/system-monitor', roles: ['super_admin'] },
];
