import { motion } from 'framer-motion';
import { BookOpen, Calendar, Users, FileCheck, CheckCircle, Star, ClipboardCheck, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { dashboardService } from '@/services/dashboardService';

export function InstructorDashboard() {
  const data = dashboardService.getInstructorData();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Assigned Courses" value={data.stats.assignedCourses} icon={BookOpen} href="/my-courses" />
        <StatsCard title="Upcoming Sessions" value={data.stats.upcomingSessions} icon={Calendar} href="/my-schedule" />
        <StatsCard title="Total Learners" value={data.stats.totalLearners} icon={Users} href="/my-courses" />
        <StatsCard title="Pending Evaluations" value={data.stats.pendingEvaluations} icon={FileCheck} href="/assessments" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Completed Sessions" value={data.stats.completedSessions} icon={CheckCircle} href="/my-schedule" />
        <StatsCard title="Assigned Assessments" value={data.stats.assignedAssessments} icon={ClipboardCheck} href="/assessments" />
        <StatsCard title="Attendance Rate" value={`${data.stats.attendanceRate}%`} icon={UserCheck} href="/sessions" />
        <StatsCard title="Avg. Rating" value={`${data.stats.averageRating} / 5`} icon={Star} />
      </div>

      {/* Sessions & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Session Schedule */}
        <Card>
          <CardHeader><CardTitle>Upcoming Session Schedule</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcomingSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.title}</p>
                    <p className="text-xs text-gray-500">{session.date} at {session.time}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="info">{session.mode}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{session.registrations} registered</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learner Participation & Attendance */}
        <Card>
          <CardHeader><CardTitle>Attendance Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.attendanceOverview.map((item, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">{item.session}</p>
                    <span className="text-xs text-gray-500">{item.present}/{item.total} present</span>
                  </div>
                  <ProgressBar value={(item.present / item.total) * 100} color={item.present / item.total >= 0.9 ? 'green' : 'gold'} size="sm" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Evaluations & Learner Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assessment Evaluations */}
        <Card>
          <CardHeader><CardTitle>Pending Assessment Evaluations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.pendingAssessmentEvaluations.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-700">{item.submissions} submissions</p>
                    <p className="text-xs text-gray-500">Due: {item.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learner Performance */}
        <Card>
          <CardHeader><CardTitle>Learner Performance (Completion %)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.learnerProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="completed" fill="#0a1628" radius={[4, 4, 0, 0]} name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
