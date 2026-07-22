import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Play, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { enrollmentService } from '@/services/enrollmentService';
import { contentService } from '@/services/contentService';
import { assessmentService } from '@/services/assessmentService';
import type { Enrollment } from '@/types';

export function MyLearningPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || '';

  const courseEnrollments = enrollmentService.getUserCourses(userId);
  const programEnrollments = enrollmentService.getUserPrograms(userId);

  const [activeTab, setActiveTab] = useState<'courses' | 'programs'>('courses');

  const handleContinue = (enrollment: Enrollment) => {
    navigate(`/my-learning/${enrollment.id}`);
  };

  const renderEnrollmentCards = (enrollments: Enrollment[], type: 'course' | 'program') => {
    if (enrollments.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          {type === 'course' ? <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" /> : <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />}
          <p className="font-medium">No enrolled {type}s yet</p>
          <p className="text-sm">Browse the catalog to enroll in {type}s</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => {
          const content = contentService.getByParent(enrollment.parentType, enrollment.courseId);
          const assessments = assessmentService.getByParent(enrollment.parentType, enrollment.courseId);
          const moduleCount = content.filter(c => c.contentType === 'module').length;
          const lessonCount = content.filter(c => c.contentType === 'lesson').length;

          return (
            <Card key={enrollment.id} hover>
              <div className="h-28 bg-gradient-to-br from-navy-800 to-navy-600 -mt-6 -mx-6 mb-4 rounded-t-xl flex items-center justify-center">
                {type === 'course'
                  ? <BookOpen className="w-8 h-8 text-gold-500" />
                  : <GraduationCap className="w-8 h-8 text-gold-500" />
                }
              </div>
              <Badge variant={enrollment.status === 'completed' ? 'success' : enrollment.status === 'in_progress' ? 'info' : 'warning'} className="mb-2">
                {enrollment.status === 'completed' ? 'Completed' : enrollment.status === 'in_progress' ? 'In Progress' : 'Enrolled'}
              </Badge>
              <h3 className="font-semibold text-gray-900 mb-2">{enrollment.courseName}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                {moduleCount > 0 && <span>{moduleCount} modules</span>}
                {lessonCount > 0 && <span>{lessonCount} lessons</span>}
                {assessments.length > 0 && <span>{assessments.length} assessments</span>}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{enrollment.progress}%</span>
                </div>
                <ProgressBar value={enrollment.progress} color={enrollment.progress === 100 ? 'green' : 'gold'} />
              </div>
              {enrollment.grade && (
                <p className="text-xs text-gray-500 mb-2">Grade: <span className="font-semibold">{enrollment.grade}</span></p>
              )}
              <Button
                variant={enrollment.status === 'completed' ? 'outline' : 'primary'}
                size="sm"
                className="w-full"
                onClick={() => handleContinue(enrollment)}
              >
                {enrollment.status === 'completed' ? (
                  <><CheckCircle className="w-4 h-4 mr-1" /> Review</>
                ) : enrollment.status === 'enrolled' ? (
                  <><Play className="w-4 h-4 mr-1" /> Start Learning</>
                ) : (
                  <><Play className="w-4 h-4 mr-1" /> Continue</>
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
        <p className="text-sm text-gray-500 mt-1">Your enrolled courses and progress</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'courses' ? 'bg-white shadow-sm text-navy-800' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <BookOpen className="w-4 h-4" /> Courses ({courseEnrollments.length})
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'programs' ? 'bg-white shadow-sm text-navy-800' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <GraduationCap className="w-4 h-4" /> Programs ({programEnrollments.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'courses' && renderEnrollmentCards(courseEnrollments, 'course')}
      {activeTab === 'programs' && renderEnrollmentCards(programEnrollments, 'program')}
    </motion.div>
  );
}
