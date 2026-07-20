import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard:        { title: 'Dashboard',            subtitle: 'Overview of your platform activity' },
  users:            { title: 'User Management',       subtitle: 'Manage platform users and roles' },
  roles:            { title: 'Roles & Permissions',   subtitle: 'Configure access control' },
  courses:          { title: 'Courses',               subtitle: 'Manage training courses' },
  programs:         { title: 'Programs',              subtitle: 'Manage training programs' },
  content:          { title: 'Content',               subtitle: 'Manage lessons, modules & media' },
  assessments:      { title: 'Assessments',           subtitle: 'Quizzes, exams and assignments' },
  enrollments:      { title: 'Enrollments',           subtitle: 'Track learner enrollments' },
  sessions:         { title: 'Sessions',              subtitle: 'Scheduled training sessions' },
  instructors:      { title: 'Instructors',           subtitle: 'Manage instructor profiles' },
  organizations:    { title: 'Organizations',         subtitle: 'Manage client organizations' },
  payments:         { title: 'Payments',              subtitle: 'Orders, invoices & transactions' },
  certificates:     { title: 'Certificates',          subtitle: 'Issued and managed certificates' },
  reports:          { title: 'Reports & Analytics',   subtitle: 'Training performance insights' },
  inquiries:        { title: 'Inquiries',             subtitle: 'Training requests & proposals' },
  notifications:    { title: 'Notifications',         subtitle: 'Alerts and system messages' },
  'media-library':  { title: 'Media Library',         subtitle: 'Videos, documents and assets' },
  'my-learning':    { title: 'My Learning',           subtitle: 'Your enrolled courses and progress' },
  'my-schedule':    { title: 'My Schedule',           subtitle: 'Upcoming and past sessions' },
  'my-courses':     { title: 'My Courses',            subtitle: 'Courses assigned to you' },
  'my-certificates':{ title: 'My Certificates',       subtitle: 'Certificates you have earned' },
  'my-assessments': { title: 'My Assessments',        subtitle: 'Pending and completed assessments' },
  settings:         { title: 'Settings',              subtitle: 'Platform configuration' },
  'system-monitor': { title: 'System Monitor',        subtitle: 'System health and activity logs' },
};

const roleLabels: Record<string, string> = {
  super_admin:     'Super Admin',
  training_admin:  'Training Admin',
  content_manager: 'Content Manager',
  instructor:      'Instructor',
  org_admin:       'Organization Admin',
  learner:         'Learner',
};

export function BreadcrumbBar() {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const currentPage = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const pageInfo = pageTitles[currentPage] || { title: currentPage, subtitle: '' };

  return (
    /* Fixed below 56px header — only the page title section */
    <div
      className="fixed top-14 right-0 z-30 bg-white border-b border-gray-200 px-6 py-3"
      style={{ left: isCollapsed ? 72 : 260, transition: 'left 0.3s' }}
    >
      <h1 className="text-xl font-bold text-gray-900">
        {currentPage === 'dashboard'
          ? `Welcome, ${user?.firstName} ${user?.lastName}`
          : pageInfo.title}
      </h1>
      <p className="text-sm text-gray-500 mt-0.5">
        {currentPage === 'dashboard'
          ? `${roleLabels[user?.role ?? '']} — ${pageInfo.subtitle}`
          : pageInfo.subtitle}
      </p>
    </div>
  );
}
