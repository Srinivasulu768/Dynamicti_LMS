import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Clock, Users, Star, DollarSign,
  CheckCircle, Play, Lock, ShoppingCart, CreditCard, Award,
  Calendar, BarChart3, FileText, Video
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { getCourseById, getCourses } from '@/services/courseService';
import type { Course } from '@/types';
import toast from 'react-hot-toast';

// Mock curriculum data
const curriculum = [
  { id: 1, title: 'Introduction & Overview', duration: '45 min', type: 'video', completed: true, locked: false },
  { id: 2, title: 'Core Concepts & Principles', duration: '60 min', type: 'video', completed: true, locked: false },
  { id: 3, title: 'Hands-On Practical Exercise', duration: '90 min', type: 'video', completed: false, locked: false },
  { id: 4, title: 'Field Assessment & Scenarios', duration: '120 min', type: 'assignment', completed: false, locked: false },
  { id: 5, title: 'Advanced Techniques', duration: '75 min', type: 'video', completed: false, locked: true },
  { id: 6, title: 'Case Studies & Analysis', duration: '60 min', type: 'document', completed: false, locked: true },
  { id: 7, title: 'Final Assessment', duration: '45 min', type: 'quiz', completed: false, locked: true },
  { id: 8, title: 'Certification & Wrap-up', duration: '30 min', type: 'video', completed: false, locked: true },
];

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [learningStarted, setLearningStarted] = useState(false);

  const course = getCourseById(id || '');

  if (!course) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Course not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/courses')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Courses
        </Button>
      </div>
    );
  }

  const handlePurchase = () => {
    setShowPurchaseModal(false);
    setEnrolled(true);
    toast.success('Enrollment successful! You can now start learning.');
  };

  const handleStartLearning = () => {
    setLearningStarted(true);
    toast.success('Welcome to the course! Let\'s begin.');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </button>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-700 rounded-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="gold">{course.category}</Badge>
              <Badge variant="info">{course.level}</Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold">{course.title}</h1>
            <p className="text-gray-300 max-w-2xl">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.enrollmentCount} enrolled</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold-500" /> {course.rating}/5</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.modules} modules · {course.lessons} lessons</span>
            </div>
            <p className="text-sm text-gray-400">Instructor: <span className="text-white font-medium">{course.instructor}</span></p>
          </div>

          {/* Price & Action */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 min-w-[260px] text-center">
            <p className="text-3xl font-bold text-gold-500 mb-1">
              {course.price === 0 ? 'FREE' : `$${course.price.toLocaleString()}`}
            </p>
            <p className="text-sm text-gray-300 mb-4">One-time payment</p>

            {!enrolled ? (
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => setShowPurchaseModal(true)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" /> Enroll Now
              </Button>
            ) : !learningStarted ? (
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handleStartLearning}
              >
                <Play className="w-4 h-4 mr-2" /> Start Learning
              </Button>
            ) : (
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => toast.success('Continuing lesson...')}
              >
                <Play className="w-4 h-4 mr-2" /> Continue Learning
              </Button>
            )}

            {enrolled && (
              <p className="text-xs text-green-400 mt-2 flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Enrolled
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Progress (shown only when enrolled) */}
          {enrolled && (
            <Card>
              <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">2 of {curriculum.length} lessons completed</span>
                  <span className="text-sm font-bold text-navy-800">25%</span>
                </div>
                <ProgressBar value={25} color="gold" size="lg" />
              </CardContent>
            </Card>
          )}

          {/* Course Curriculum */}
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {curriculum.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                      lesson.completed
                        ? 'bg-green-50 border-green-200'
                        : lesson.locked && !enrolled
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (enrolled && !lesson.locked) {
                        toast.success(`Playing: ${lesson.title}`);
                      } else if (!enrolled) {
                        toast('Enroll to access this lesson', { icon: '🔒' });
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : lesson.locked && !enrolled ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <span className="w-6 h-6 bg-navy-800/10 rounded-full flex items-center justify-center text-xs font-medium text-navy-800">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.duration} · {lesson.type}</p>
                    </div>
                    {enrolled && !lesson.locked && !lesson.completed && (
                      <Play className="w-4 h-4 text-navy-800" />
                    )}
                    {lesson.type === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                    {lesson.type === 'document' && <FileText className="w-4 h-4 text-gray-400" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                  <span className="text-sm font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Level</span>
                  <span className="text-sm font-medium capitalize">{course.level}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Modules</span>
                  <span className="text-sm font-medium">{course.modules}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><FileText className="w-4 h-4" /> Lessons</span>
                  <span className="text-sm font-medium">{course.lessons}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" /> Capacity</span>
                  <span className="text-sm font-medium">{course.enrollmentCount}/{course.capacity}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start Date</span>
                  <span className="text-sm font-medium">{course.startDate}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Award className="w-4 h-4" /> Certificate</span>
                  <span className="text-sm font-medium text-green-600">Included</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {course.tags && course.tags.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-navy-800/5 text-navy-800 text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Prerequisites</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq) => {
                    const prereqCourse = getCourseById(prereq);
                    return (
                      <li key={prereq} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        {prereqCourse?.title || prereq}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Enroll in Course" size="md">
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">{course.title}</span>
              <span className="text-sm font-medium">${course.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm font-medium">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-navy-800">${course.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" defaultChecked className="accent-navy-800" />
                <CreditCard className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Credit / Debit Card</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" className="accent-navy-800" />
                <DollarSign className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Bank Transfer</span>
              </label>
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-3">
            <div className="relative">
              <input type="text" placeholder="Card Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="MM/YY" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="text" placeholder="CVV" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowPurchaseModal(false)}>
              Cancel
            </Button>
            <Button variant="gold" className="flex-1" onClick={handlePurchase}>
              <Lock className="w-4 h-4 mr-1" /> Pay ${course.price.toLocaleString()}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
