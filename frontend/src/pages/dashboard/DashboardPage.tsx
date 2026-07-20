import { useAuth } from '@/contexts/AuthContext';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { TrainingAdminDashboard } from './TrainingAdminDashboard';
import { ContentManagerDashboard } from './ContentManagerDashboard';
import { InstructorDashboard } from './InstructorDashboard';
import { OrgAdminDashboard } from './OrgAdminDashboard';
import { LearnerDashboard } from './LearnerDashboard';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'training_admin':
      return <TrainingAdminDashboard />;
    case 'content_manager':
      return <ContentManagerDashboard />;
    case 'instructor':
      return <InstructorDashboard />;
    case 'org_admin':
      return <OrgAdminDashboard />;
    case 'learner':
      return <LearnerDashboard />;
    default:
      return <LearnerDashboard />;
  }
}
