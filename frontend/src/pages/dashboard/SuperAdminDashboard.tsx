import { motion } from 'framer-motion';
import { Users, BookOpen, UserPlus, Building2, Calendar, DollarSign, Award, MessageSquare, GraduationCap, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import dashboardData from '@/mock/dashboard.json';

const COLORS = ['#0a1628', '#d4a843', '#2563eb', '#10b981', '#f59e0b'];

export function SuperAdminDashboard() {
  const data = dashboardData.superAdmin;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* KPIs Row 1 - Users, Learners, Courses, Enrollments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={data.stats.totalUsers.toLocaleString()} icon={Users} trend={{ value: 12, isPositive: true }} href="/users" />
        <StatsCard title="Total Learners" value={data.stats.totalLearners.toLocaleString()} icon={GraduationCap} trend={{ value: 9, isPositive: true }} href="/users" />
        <StatsCard title="Total Courses" value={data.stats.totalCourses} icon={BookOpen} trend={{ value: 5, isPositive: true }} href="/courses" />
        <StatsCard title="Total Enrollments" value={data.stats.totalEnrollments.toLocaleString()} icon={UserPlus} trend={{ value: 18, isPositive: true }} href="/enrollments" />
      </div>

      {/* KPIs Row 2 - Sessions, Orgs, Revenue, Certificates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Sessions" value={data.stats.totalSessions} icon={Calendar} href="/sessions" />
        <StatsCard title="Organizations" value={data.stats.totalOrganizations} icon={Building2} trend={{ value: 8, isPositive: true }} href="/organizations" />
        <StatsCard title="Revenue (Monthly)" value={`$${data.stats.revenue.toLocaleString()}`} icon={DollarSign} trend={{ value: 15, isPositive: true }} href="/payments" />
        <StatsCard title="Certificates Issued" value={data.stats.certificatesIssued.toLocaleString()} icon={Award} href="/certificates" />
      </div>

      {/* Charts - Enrollment & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Enrollment Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.enrollmentChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#0a1628" strokeWidth={2} dot={{ fill: '#d4a843' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sales & Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="value" stroke="#d4a843" strokeWidth={2} dot={{ fill: '#0a1628' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid - Activities, Integration Health, System Alerts, Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Platform Activities */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} · {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration & System Health */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Integration Health</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.integrationStatus.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${service.status === 'healthy' ? 'text-green-500' : 'text-yellow-500'}`} />
                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                  </div>
                  <Badge variant={service.status === 'healthy' ? 'success' : 'warning'} className="text-[10px]">
                    {service.uptime}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operational Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Alerts & Notifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.systemAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Top Courses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.topCourses} dataKey="enrollments" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => (name as string)?.split(' ')[0]}>
                  {data.topCourses.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
