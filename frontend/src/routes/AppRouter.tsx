import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
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
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin Routes */}
          <Route path="/users" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin']}><UsersPage /></ProtectedRoute>} />
          <Route path="/roles" element={<ProtectedRoute allowedRoles={['super_admin']}><RolesPermissionsPage /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'content_manager', 'instructor']}><CoursesPage /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'content_manager', 'instructor', 'learner', 'org_admin']}><CourseDetailPage /></ProtectedRoute>} />
          <Route path="/programs" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'content_manager']}><ProgramsPage /></ProtectedRoute>} />
          <Route path="/programs/:id" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'content_manager', 'learner', 'org_admin']}><ProgramDetailPage /></ProtectedRoute>} />
          <Route path="/content" element={<ProtectedRoute allowedRoles={['super_admin', 'content_manager']}><ContentPage /></ProtectedRoute>} />
          <Route path="/assessments" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'content_manager', 'instructor']}><AssessmentsPage /></ProtectedRoute>} />
          <Route path="/enrollments" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'org_admin']}><EnrollmentsPage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'instructor']}><SessionsPage /></ProtectedRoute>} />
          <Route path="/instructors" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin']}><InstructorsPage /></ProtectedRoute>} />
          <Route path="/organizations" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin']}><OrganizationsPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin']}><PaymentsPage /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'org_admin']}><CertificatesPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin', 'org_admin']}><ReportsPage /></ProtectedRoute>} />
          <Route path="/inquiries" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin']}><InquiriesPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin']}><NotificationsPage /></ProtectedRoute>} />
          <Route path="/media-library" element={<ProtectedRoute allowedRoles={['super_admin', 'content_manager']}><MediaLibraryPage /></ProtectedRoute>} />

          {/* Learner Routes */}
          <Route path="/my-learning" element={<ProtectedRoute allowedRoles={['learner']}><MyLearningPage /></ProtectedRoute>} />
          <Route path="/my-schedule" element={<ProtectedRoute allowedRoles={['learner', 'instructor']}><MySchedulePage /></ProtectedRoute>} />
          <Route path="/my-certificates" element={<ProtectedRoute allowedRoles={['learner']}><MyCertificatesPage /></ProtectedRoute>} />
          <Route path="/my-assessments" element={<ProtectedRoute allowedRoles={['learner']}><MyAssessmentsPage /></ProtectedRoute>} />

          {/* Instructor Routes */}
          <Route path="/my-courses" element={<ProtectedRoute allowedRoles={['instructor']}><MyCoursesPage /></ProtectedRoute>} />

          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['super_admin', 'training_admin']}><SettingsPage /></ProtectedRoute>} />
          <Route path="/system-monitor" element={<ProtectedRoute allowedRoles={['super_admin']}><SystemMonitorPage /></ProtectedRoute>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
