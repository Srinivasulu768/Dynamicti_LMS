export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  module: string;
}

export const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', module: 'Dashboard' },
  { id: 'users', label: 'Users', icon: 'Users', path: '/users', module: 'Users' },
  { id: 'roles', label: 'Roles & Permissions', icon: 'Shield', path: '/roles', module: 'Roles' },
  { id: 'courses', label: 'Courses', icon: 'BookOpen', path: '/courses', module: 'Courses' },
  { id: 'programs', label: 'Programs', icon: 'GraduationCap', path: '/programs', module: 'Programs' },
  { id: 'content', label: 'Content', icon: 'FileText', path: '/content', module: 'Content' },
  { id: 'assessments', label: 'Assessments', icon: 'ClipboardCheck', path: '/assessments', module: 'Assessments' },
  { id: 'enrollments', label: 'Enrollments', icon: 'UserPlus', path: '/enrollments', module: 'Enrollments' },
  { id: 'sessions', label: 'Sessions', icon: 'Calendar', path: '/sessions', module: 'Sessions' },
  { id: 'instructors', label: 'Instructors', icon: 'GraduationCap', path: '/instructors', module: 'Instructors' },
  { id: 'organizations', label: 'Organizations', icon: 'Building2', path: '/organizations', module: 'Organizations' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard', path: '/payments', module: 'Payments' },
  { id: 'certificates', label: 'Certificates', icon: 'Award', path: '/certificates', module: 'Certificates' },
  { id: 'reports', label: 'Reports', icon: 'BarChart3', path: '/reports', module: 'Reports' },
  { id: 'inquiries', label: 'Inquiries', icon: 'MessageSquare', path: '/inquiries', module: 'Inquiries' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell', path: '/notifications', module: 'Notifications' },
  { id: 'media-library', label: 'Media Library', icon: 'Video', path: '/media-library', module: 'Media Library' },
  { id: 'my-learning', label: 'My Learning', icon: 'BookMarked', path: '/my-learning', module: 'My Learning' },
  { id: 'my-schedule', label: 'My Schedule', icon: 'CalendarDays', path: '/my-schedule', module: 'My Schedule' },
  { id: 'my-courses', label: 'My Courses', icon: 'BookOpen', path: '/my-courses', module: 'My Courses' },
  { id: 'my-certificates', label: 'My Certificates', icon: 'Award', path: '/my-certificates', module: 'My Certificates' },
  { id: 'my-assessments', label: 'My Assessments', icon: 'ClipboardCheck', path: '/my-assessments', module: 'My Assessments' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/settings', module: 'Settings' },
  { id: 'system-monitor', label: 'System Monitor', icon: 'Activity', path: '/system-monitor', module: 'System Monitor' },
];
