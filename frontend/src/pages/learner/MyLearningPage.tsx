import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, CheckCircle, Clock, Video, FileText, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import dashboardData from '@/mock/dashboard.json';
import toast from 'react-hot-toast';

// Mock lesson data for the learning player
const courseLessons: Record<string, { id: number; title: string; duration: string; type: string; completed: boolean }[]> = {
  'Network Security Fundamentals': [
    { id: 1, title: 'Introduction to Network Security', duration: '12 min', type: 'video', completed: true },
    { id: 2, title: 'Firewalls & Packet Filtering', duration: '18 min', type: 'video', completed: true },
    { id: 3, title: 'VPN Technologies', duration: '15 min', type: 'video', completed: true },
    { id: 4, title: 'Intrusion Detection Systems', duration: '20 min', type: 'video', completed: false },
    { id: 5, title: 'Network Security Assessment', duration: '30 min', type: 'quiz', completed: false },
  ],
  'Cybersecurity Operations': [
    { id: 1, title: 'Threat Landscape Overview', duration: '15 min', type: 'video', completed: true },
    { id: 2, title: 'Incident Response Framework', duration: '22 min', type: 'video', completed: false },
    { id: 3, title: 'Forensic Analysis Basics', duration: '25 min', type: 'video', completed: false },
    { id: 4, title: 'Practical Lab Exercise', duration: '45 min', type: 'assignment', completed: false },
  ],
  'Compliance Training': [
    { id: 1, title: 'Regulatory Overview', duration: '10 min', type: 'video', completed: true },
    { id: 2, title: 'Policy & Procedures', duration: '15 min', type: 'document', completed: true },
    { id: 3, title: 'Compliance Assessment', duration: '20 min', type: 'quiz', completed: true },
  ],
  'Project Management': [
    { id: 1, title: 'PM Fundamentals', duration: '18 min', type: 'video', completed: true },
    { id: 2, title: 'Planning & Scheduling', duration: '22 min', type: 'video', completed: false },
    { id: 3, title: 'Risk Management', duration: '20 min', type: 'video', completed: false },
    { id: 4, title: 'Agile Methodologies', duration: '25 min', type: 'video', completed: false },
    { id: 5, title: 'Final Exam', duration: '45 min', type: 'quiz', completed: false },
  ],
  'Leadership Basics': [
    { id: 1, title: 'Leadership Styles', duration: '12 min', type: 'video', completed: true },
    { id: 2, title: 'Team Building', duration: '15 min', type: 'video', completed: true },
    { id: 3, title: 'Decision Making', duration: '18 min', type: 'video', completed: true },
    { id: 4, title: 'Leadership Assessment', duration: '20 min', type: 'quiz', completed: true },
  ],
};

export function MyLearningPage() {
  const navigate = useNavigate();
  const courses = dashboardData.learner.myCourses;
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [currentLesson, setCurrentLesson] = useState<{ id: number; title: string; duration: string; type: string; completed: boolean } | null>(null);

  const handleContinue = (course: typeof courses[0]) => {
    setSelectedCourse(course);
    setShowPlayerModal(true);
  };

  const handlePlayLesson = (lesson: typeof courseLessons[''][0]) => {
    setCurrentLesson(lesson);
    setShowLessonModal(true);
  };

  const getLessons = (courseTitle: string) => {
    // Match by partial title
    const key = Object.keys(courseLessons).find(k => courseTitle.includes(k));
    return key ? courseLessons[key] : [];
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
        <p className="text-sm text-gray-500 mt-1">Continue where you left off</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <Card key={i} hover>
            <div className="h-28 bg-gradient-to-br from-navy-800 to-navy-600 -mt-6 -mx-6 mb-4 rounded-t-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gold-500" />
            </div>
            <Badge variant={course.status === 'completed' ? 'success' : 'info'} className="mb-2">
              {course.status === 'completed' ? 'Completed' : 'In Progress'}
            </Badge>
            <h3 className="font-semibold text-gray-900 mb-3">{course.title}</h3>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <ProgressBar value={course.progress} color={course.progress === 100 ? 'green' : 'gold'} />
            </div>
            <Button
              variant={course.status === 'completed' ? 'outline' : 'primary'}
              size="sm"
              className="w-full"
              onClick={() => handleContinue(course)}
            >
              {course.status === 'completed' ? (
                <><CheckCircle className="w-4 h-4 mr-1" /> Review</>
              ) : (
                <><Play className="w-4 h-4 mr-1" /> Continue</>
              )}
            </Button>
          </Card>
        ))}
      </div>

      {/* Course Player / Lessons Modal */}
      <Modal isOpen={showPlayerModal} onClose={() => setShowPlayerModal(false)} title="" size="xl">
        {selectedCourse && (
          <div className="space-y-4">
            {/* Course Header */}
            <div className="bg-gradient-to-r from-navy-900 to-navy-700 rounded-lg p-5 text-white">
              <Badge variant={selectedCourse.status === 'completed' ? 'success' : 'info'} className="mb-2">
                {selectedCourse.status === 'completed' ? 'Completed' : 'In Progress'}
              </Badge>
              <h2 className="text-lg font-bold">{selectedCourse.title}</h2>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-300">Progress: {selectedCourse.progress}%</span>
                <span className="text-sm text-gray-300">
                  {getLessons(selectedCourse.title).filter(l => l.completed).length}/{getLessons(selectedCourse.title).length} lessons
                </span>
              </div>
              <ProgressBar value={selectedCourse.progress} color="gold" size="sm" className="mt-2" />
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Course Content</h3>
              {getLessons(selectedCourse.title).map((lesson, idx) => {
                const nextIncomplete = getLessons(selectedCourse.title).findIndex(l => !l.completed);
                const isNext = idx === nextIncomplete;
                return (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      lesson.completed
                        ? 'bg-green-50 border-green-200'
                        : isNext
                        ? 'bg-gold-500/5 border-gold-500/30 hover:shadow-sm'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                    onClick={() => {
                      if (lesson.completed || isNext) {
                        handlePlayLesson(lesson);
                      } else {
                        toast('Complete previous lessons first', { icon: '🔒' });
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isNext ? (
                        <Play className="w-5 h-5 text-gold-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3" /> {lesson.duration}
                        <span className="capitalize">· {lesson.type}</span>
                      </div>
                    </div>
                    {isNext && !lesson.completed && (
                      <Badge variant="gold" className="text-[10px]">Next</Badge>
                    )}
                    {lesson.type === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                    {lesson.type === 'document' && <FileText className="w-4 h-4 text-gray-400" />}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowPlayerModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Lesson Player Modal */}
      <Modal isOpen={showLessonModal} onClose={() => setShowLessonModal(false)} title="" size="xl">
        {currentLesson && (
          <div className="space-y-4">
            {currentLesson.type === 'video' ? (
              <>
                {/* Video Player */}
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative">
                  <div className="text-center">
                    <div
                      className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/20 transition-colors"
                      onClick={() => toast.success('Video playing...')}
                    >
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white/60 text-sm">Click to play</p>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-white text-xs">0:00</span>
                      <div className="flex-1 mx-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-gold-500 rounded-full" />
                      </div>
                      <span className="text-white text-xs">{currentLesson.duration}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{currentLesson.title}</h3>
                <p className="text-sm text-gray-500">Duration: {currentLesson.duration}</p>
              </>
            ) : currentLesson.type === 'quiz' ? (
              <div className="space-y-4">
                <div className="bg-navy-800/5 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{currentLesson.title}</h3>
                  <p className="text-sm text-gray-500">Duration: {currentLesson.duration} · Multiple choice</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-3">Q1. What is the correct procedure in this scenario?</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer"><input type="radio" name="q1" className="accent-navy-800" /> Option A</label>
                    <label className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer"><input type="radio" name="q1" className="accent-navy-800" /> Option B</label>
                    <label className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer"><input type="radio" name="q1" className="accent-navy-800" /> Option C</label>
                    <label className="flex items-center gap-2 text-sm p-2 rounded hover:bg-gray-50 cursor-pointer"><input type="radio" name="q1" className="accent-navy-800" /> Option D</label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-navy-800/5 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{currentLesson.title}</h3>
                  <p className="text-sm text-gray-500">Type: {currentLesson.type} · Duration: {currentLesson.duration}</p>
                </div>
                <div className="p-6 border border-gray-200 rounded-lg text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Content loaded. Read through the material and mark as complete when finished.</p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowLessonModal(false)}>Close</Button>
              <Button
                variant="gold"
                onClick={() => {
                  setShowLessonModal(false);
                  toast.success('Lesson marked as complete! 🎉');
                }}
              >
                <CheckCircle className="w-4 h-4 mr-1" /> Mark Complete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
