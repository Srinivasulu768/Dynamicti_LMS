import { motion } from 'framer-motion';
import { BookOpen, Calendar, UserPlus, MessageSquare, ClipboardCheck, Award, CheckCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { dashboardService } from '@/services/dashboardService';

const COLORS = ['#10b981', '#3b82f6', '#94a3b8'];

export function TrainingAdminDashboard() {
  const data = dashboardService.getTrainingAdminData();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Courses" value={data.stats.activeCourses} icon={BookOpen} href="/courses" />
        <StatsCard title="Completed Courses" value={data.stats.completedCourses} icon={CheckCircle} href="/courses" />
        <StatsCard title="Upcoming Sessions" value={data.stats.upcomingSessions} icon={Calendar} href="/sessions" />
        <StatsCard title="Total Enrollments" value={data.stats.totalEnrollments.toLocaleString()} icon={UserPlus} href="/enrollments" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Completion Rate" value={`${data.stats.completionRate}%`} icon={TrendingUp} trend={{ value: 5, isPositive: true }} href="/reports" />
        <StatsCard title="Open Inquiries" value={data.stats.openInquiries} icon={MessageSquare} href="/inquiries" />
        <StatsCard title="Assessments" value={data.stats.assessments} icon={ClipboardCheck} href="/assessments" />
        <StatsCard title="Certificates Issued" value={data.stats.certificatesIssued} icon={Award} href="/certificates" />
      </div>

      {/* Charts - Enrollment Progress & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learner Progress Statistics */}
        <Card>
          <CardHeader><CardTitle>Enrollment & Completion Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.learnerProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="enrolled" fill="#0a1628" radius={[4, 4, 0, 0]} name="Enrolled" />
                <Bar dataKey="completed" fill="#d4a843" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enrollment Status */}
        <Card>
          <CardHeader><CardTitle>Enrollment Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.enrollmentStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {data.enrollmentStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sessions & Certification Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Training Sessions */}
        <Card>
          <CardHeader><CardTitle>Upcoming Training Sessions</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Title</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Registrations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.upcomingSessions.map((session, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{session.title}</td>
                      <td className="py-3 text-gray-600">{session.date}</td>
                      <td className="py-3"><Badge variant="info">{session.type}</Badge></td>
                      <td className="py-3 text-gray-600">{session.registrations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Issuance Status */}
        <Card>
          <CardHeader><CardTitle>Certificate Issuance Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-700">{data.certificationStats.issuedThisMonth}</p>
                  <p className="text-xs text-green-600 mt-1">Issued This Month</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-700">{data.certificationStats.pendingApproval}</p>
                  <p className="text-xs text-yellow-600 mt-1">Pending Approval</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-700">{data.certificationStats.expiringSoon}</p>
                  <p className="text-xs text-red-600 mt-1">Expiring Soon</p>
                </div>
              </div>
            </div>

            {/* Training Inquiry Status */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Training Inquiry Status</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 font-medium">Company</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recentInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-gray-50">
                        <td className="py-2 font-medium text-gray-900">{inq.company}</td>
                        <td className="py-2 text-gray-600">{inq.type}</td>
                        <td className="py-2">
                          <Badge variant={inq.status === 'new' ? 'info' : inq.status === 'in_progress' ? 'warning' : 'default'}>
                            {inq.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
