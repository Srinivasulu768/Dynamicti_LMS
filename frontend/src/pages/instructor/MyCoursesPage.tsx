import { motion } from 'framer-motion';
import { BookOpen, Users, Star, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import coursesData from '@/mock/courses.json';

export function MyCoursesPage() {
  const myCourses = coursesData.filter(c => c.instructorId === 'USR004');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-sm text-gray-500 mt-1">{myCourses.length} assigned courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.map((course) => (
          <Card key={course.id} hover>
            <div className="h-28 bg-gradient-to-br from-navy-800 to-navy-600 -mt-6 -mx-6 mb-4 rounded-t-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gold-500" />
            </div>
            <Badge variant="success" className="mb-2">{course.status}</Badge>
            <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {course.enrollmentCount} / {course.capacity} enrolled</div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-gold-500" /> {course.rating} rating</div>
              <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> {course.modules} modules · {course.lessons} lessons</div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Enrollment</span>
                <span>{Math.round((course.enrollmentCount/course.capacity)*100)}%</span>
              </div>
              <ProgressBar value={course.enrollmentCount} max={course.capacity} size="sm" color="gold" />
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
