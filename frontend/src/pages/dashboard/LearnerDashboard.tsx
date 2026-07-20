import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, CheckCircle, Award, Clock } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import dashboardData from '@/mock/dashboard.json';

export function LearnerDashboard() {
  const data = dashboardData.learner;
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Enrolled Courses" value={data.stats.enrolledCourses} icon={BookOpen} href="/my-learning" />
        <StatsCard title="In Progress" value={data.stats.inProgress} icon={PlayCircle} href="/my-learning" />
        <StatsCard title="Completed" value={data.stats.completed} icon={CheckCircle} href="/my-learning" />
        <StatsCard title="Certificates" value={data.stats.certificates} icon={Award} href="/my-certificates" />
        <StatsCard title="Hours Learned" value={data.stats.totalHoursLearned} icon={Clock} href="/my-learning" />
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Learning Progress</span>
            <span className="text-sm font-bold text-navy-800">{data.stats.overallProgress}%</span>
          </div>
          <ProgressBar value={data.stats.overallProgress} size="lg" color="gold" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrolled Courses with Progress */}
        <Card>
          <CardHeader><CardTitle>My Courses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.myCourses.map((course, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                  onClick={() => navigate('/my-learning')}
                >
                  <div className="flex-1 mr-4">
                    <p className="text-sm font-medium text-gray-900">{course.title}</p>
                    <ProgressBar value={course.progress} size="sm" color={course.progress === 100 ? 'green' : 'navy'} className="mt-1.5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">{course.progress}%</span>
                    <Badge variant={course.status === 'completed' ? 'success' : 'info'} className="text-[10px]">
                      {course.status === 'completed' ? 'Done' : 'Active'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate('/my-learning')}>
              View All Courses
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Upcoming Scheduled Sessions */}
          <Card>
            <CardHeader><CardTitle>Upcoming Sessions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.upcomingSessions.map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate('/my-schedule')}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.title}</p>
                      <p className="text-xs text-gray-500">{session.date} at {session.time}</p>
                    </div>
                    <Badge variant="info" className="text-[10px]">Scheduled</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate('/my-schedule')}>
                View Full Schedule
              </Button>
            </CardContent>
          </Card>

          {/* Pending Assessments */}
          <Card>
            <CardHeader><CardTitle>Pending Assessments</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.pendingAssessments.map((assessment, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                    onClick={() => navigate('/my-assessments')}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                      <p className="text-xs text-gray-500">{assessment.course}</p>
                    </div>
                    <span className="text-xs text-yellow-700 font-medium">Due: {assessment.dueDate}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate('/my-assessments')}>
                View All Assessments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row - Certificates & Learning History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificates Earned */}
        <Card>
          <CardHeader><CardTitle>Certificates Earned</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentCertificates.map((cert, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                  onClick={() => navigate('/my-certificates')}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cert.title}</p>
                    <p className="text-xs text-gray-500">Issued: {cert.date}</p>
                  </div>
                  <Award className="w-5 h-5 text-gold-500" />
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => navigate('/my-certificates')}>
              View All Certificates
            </Button>
          </CardContent>
        </Card>

        {/* Learning History */}
        <Card>
          <CardHeader><CardTitle>Learning History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.learningHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">Completed: {item.completedDate} · {item.hours} hours</p>
                  </div>
                  <Badge variant="success">{item.grade}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
