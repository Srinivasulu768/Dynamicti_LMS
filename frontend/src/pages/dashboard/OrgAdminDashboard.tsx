import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, CheckCircle, Calendar, Percent, MessageSquare, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { dashboardService } from '@/services/dashboardService';

export function OrgAdminDashboard() {
  const data = dashboardService.getOrgAdminData();
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Organization Users" value={data.stats.totalUsers} icon={Users} href="/enrollments" />
        <StatsCard title="Active Enrollments" value={data.stats.activeEnrollments} icon={UserPlus} href="/enrollments" />
        <StatsCard title="Completed Trainings" value={data.stats.completedTrainings} icon={CheckCircle} href="/reports" />
        <StatsCard title="Upcoming Sessions" value={data.stats.upcomingSessions} icon={Calendar} href="/enrollments" />
        <StatsCard title="Compliance Rate" value={`${data.stats.complianceRate}%`} icon={Percent} href="/reports" />
        <StatsCard title="Training Requests" value={data.stats.openRequests} icon={MessageSquare} href="/enrollments" />
      </div>

      {/* Training Progress & Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learner Progress & Completion Tracking */}
        <Card>
          <CardHeader><CardTitle>Training Progress by Category</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trainingProgress.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="text-gray-500">{item.progress}%</span>
                  </div>
                  <ProgressBar value={item.progress} color={item.progress >= 80 ? 'green' : item.progress >= 60 ? 'gold' : 'navy'} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Training Status */}
        <Card>
          <CardHeader><CardTitle>Compliance Training Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.complianceOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#d4a843" strokeWidth={2} dot={{ fill: '#0a1628' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Training Requests & Recent Completions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Requests */}
        <Card>
          <CardHeader><CardTitle>Training Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.trainingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.title}</p>
                    <p className="text-xs text-gray-500">Requested by {req.requestedBy} · {req.users} users</p>
                  </div>
                  <Badge variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'info' : 'success'}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Learner Completions */}
        <Card>
          <CardHeader><CardTitle>Recent Learner Completions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.learnerCompletions.map((completion, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{completion.name}</p>
                    <p className="text-xs text-gray-500">{completion.course} · {completion.completedDate}</p>
                  </div>
                  <Badge variant="success">{completion.grade}</Badge>
                </div>
              ))}
            </div>

            {/* Quick link to reports */}
            <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate('/reports')}>
              <BarChart3 className="w-4 h-4 mr-1" /> View Organization Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
