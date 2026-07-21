import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { CoursesPage } from '@/pages/courses/CoursesPage';
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage';
import { ProgramsPage } from '@/pages/programs/ProgramsPage';
import { ProgramDetailPage } from '@/pages/programs/ProgramDetailPage';
import { InstructorsPage } from '@/pages/instructors/InstructorsPage';
import { RolesPermissionsPage } from '@/pages/roles/RolesPermissionsPage';
import { ContentPage } from '@/pages/content/ContentPage';
import { AssessmentsPage } from '@/pages/assessments/AssessmentsPage';
import { EnrollmentsPage } from '@/pages/enrollments/EnrollmentsPage';
import { SessionsPage } from '@/pages/sessions/SessionsPage';
import { OrganizationsPage } from '@/pages/organizations/OrganizationsPage';
import { PaymentsPage } from '@/pages/payments/PaymentsPage';
import { CertificatesPage } from '@/pages/certificates/CertificatesPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { InquiriesPage } from '@/pages/inquiries/InquiriesPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { MediaLibraryPage } from '@/pages/media/MediaLibraryPage';
import { MyLearningPage } from '@/pages/learner/MyLearningPage';
import { MySchedulePage } from '@/pages/learner/MySchedulePage';
import { MyCertificatesPage } from '@/pages/learner/MyCertificatesPage';
import { MyAssessmentsPage } from '@/pages/learner/MyAssessmentsPage';
import { MyCoursesPage } from '@/pages/instructor/MyCoursesPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { SystemMonitorPage } from '@/pages/system/SystemMonitorPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Layout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute module="Dashboard"><DashboardPage /></ProtectedRoute>} />

          {/* Module routes — access checked via permissions context */}
          <Route path="/users" element={<ProtectedRoute module="Users"><UsersPage /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute module="Roles"><RolesPermissionsPage /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute module="Courses"><CoursesPage /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute module="Courses"><CourseDetailPage /></ProtectedRoute>} />
          <Route path="/programs" element={<ProtectedRoute module="Programs"><ProgramsPage /></ProtectedRoute>} />
          <Route path="/programs/:id" element={<ProtectedRoute module="Programs"><ProgramDetailPage /></ProtectedRoute>} />
          <Route path="/content" element={<ProtectedRoute module="Content"><ContentPage /></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute module="Assessments"><AssessmentsPage /></ProtectedRoute>} />
          <Route path="/enrollments" element={<ProtectedRoute module="Enrollments"><EnrollmentsPage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute module="Sessions"><SessionsPage /></ProtectedRoute>} />
          <Route path="/instructors" element={<ProtectedRoute module="Instructors"><InstructorsPage /></ProtectedRoute>} />
          <Route path="/organizations" element={<ProtectedRoute module="Organizations"><OrganizationsPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute module="Payments"><PaymentsPage /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute module="Certificates"><CertificatesPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute module="Reports"><ReportsPage /></ProtectedRoute>} />
          <Route path="/inquiries" element={<ProtectedRoute module="Inquiries"><InquiriesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute module="Notifications"><NotificationsPage /></ProtectedRoute>} />
          <Route path="/media-library" element={<ProtectedRoute module="Media Library"><MediaLibraryPage /></ProtectedRoute>} />

          {/* Personal modules */}
          <Route path="/my-learning" element={<ProtectedRoute module="My Learning"><MyLearningPage /></ProtectedRoute>} />
          <Route path="/my-schedule" element={<ProtectedRoute module="My Schedule"><MySchedulePage /></ProtectedRoute>} />
          <Route path="/my-certificates" element={<ProtectedRoute module="My Certificates"><MyCertificatesPage /></ProtectedRoute>} />
          <Route path="/my-assessments" element={<ProtectedRoute module="My Assessments"><MyAssessmentsPage /></ProtectedRoute>} />
          <Route path="/my-courses" element={<ProtectedRoute module="My Courses"><MyCoursesPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/settings" element={<ProtectedRoute module="Settings"><SettingsPage /></ProtectedRoute>} />
          <Route path="/system-monitor" element={<ProtectedRoute module="System Monitor"><SystemMonitorPage /></ProtectedRoute>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
