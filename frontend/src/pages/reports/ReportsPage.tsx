import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatsCard } from '@/components/ui/StatsCard';
import { dashboardService } from '@/services/dashboardService';
import toast from 'react-hot-toast';

const enrollmentByMonth = [
  { name: 'Jan', enrolled: 120, completed: 85 },
  { name: 'Feb', enrolled: 150, completed: 98 },
  { name: 'Mar', enrolled: 200, completed: 145 },
  { name: 'Apr', enrolled: 180, completed: 130 },
  { name: 'May', enrolled: 220, completed: 160 },
  { name: 'Jun', enrolled: 280, completed: 195 },
  { name: 'Jul', enrolled: 250, completed: 180 },
];

const revenueByCategory = [
  { name: 'Cybersecurity', revenue: 45000 },
  { name: 'Leadership', revenue: 28000 },
  { name: 'Technology', revenue: 35000 },
  { name: 'Compliance', revenue: 18000 },
  { name: 'Management', revenue: 22000 },
];

export function ReportsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive training analytics</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('Report exported!')}>
          <Download className="w-4 h-4 mr-1" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Enrollments" value="2,456" icon={Users} trend={{ value: 18, isPositive: true }} />
        <StatsCard title="Completion Rate" value="72%" icon={TrendingUp} trend={{ value: 5, isPositive: true }} />
        <StatsCard title="Active Courses" value="86" icon={BookOpen} />
        <StatsCard title="Certificates" value="1,987" icon={Award} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Enrollment & Completion Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={enrollmentByMonth}>
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

        <Card>
          <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" fontSize={12} stroke="#94a3b8" width={100} />
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#162d50" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardService.getSuperAdminData().revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="value" stroke="#d4a843" strokeWidth={2} dot={{ fill: '#0a1628', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
