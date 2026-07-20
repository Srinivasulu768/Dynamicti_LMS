import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, FileEdit, Layers, FileText, ClipboardCheck, GraduationCap, Archive } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import dashboardData from '@/mock/dashboard.json';

const COLORS = ['#10b981', '#f59e0b', '#94a3b8'];

export function ContentManagerDashboard() {
  const data = dashboardData.contentManager;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* KPIs Row 1 - Course & Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Courses" value={data.stats.totalCourses} icon={BookOpen} href="/courses" />
        <StatsCard title="Total Programs" value={data.stats.totalPrograms} icon={GraduationCap} href="/programs" />
        <StatsCard title="Published Courses" value={data.stats.publishedCourses} icon={CheckCircle} href="/courses" />
        <StatsCard title="Draft Courses" value={data.stats.draftCourses} icon={FileEdit} href="/courses" />
      </div>

      {/* KPIs Row 2 - Content & Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Archived Courses" value={data.stats.archivedCourses} icon={Archive} href="/courses" />
        <StatsCard title="Total Modules" value={data.stats.totalModules} icon={Layers} href="/content" />
        <StatsCard title="Total Lessons" value={data.stats.totalLessons} icon={FileText} href="/content" />
        <StatsCard title="Assessments" value={data.stats.assessments} icon={ClipboardCheck} href="/assessments" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Status Distribution */}
        <Card>
          <CardHeader><CardTitle>Course Status (Published / Draft / Archived)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.courseStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {data.courseStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Publication Status */}
        <Card>
          <CardHeader><CardTitle>Content Publication Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.contentPublicationStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" fontSize={12} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" fontSize={11} stroke="#94a3b8" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#0a1628" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Drafts / Content Pending Review */}
      <Card>
        <CardHeader><CardTitle>Recent Drafts & Content in Review</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentDrafts.map((draft, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-navy-800/5 rounded-lg flex items-center justify-center">
                    {draft.type === 'course' ? <BookOpen className="w-4 h-4 text-navy-800" /> : <Layers className="w-4 h-4 text-navy-800" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{draft.title}</p>
                    <p className="text-xs text-gray-500">Last edited: {draft.lastEdited} · Type: {draft.type}</p>
                  </div>
                </div>
                <Badge variant={draft.status === 'draft' ? 'warning' : 'info'}>{draft.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
