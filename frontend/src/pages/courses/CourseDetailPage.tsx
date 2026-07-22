import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Clock, Users, Star, DollarSign,
  Lock, ShoppingCart, CreditCard, Award,
  Calendar, BarChart3, FileText, Video, ChevronDown, ChevronUp,
  ClipboardList, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { getCourseById } from '@/services/courseService';
import toast from 'react-hot-toast';

// Mock curriculum sections with lessons
const curriculumSections = [
  {
    id: 'SEC001',
    title: 'Introduction & Overview',
    lessons: [
      { id: 'L001', title: 'Welcome & Course Overview', duration: '5:30', type: 'video' },
      { id: 'L002', title: 'Course Objectives', duration: '8:15', type: 'video' },
      { id: 'L003', title: 'Pre-Assessment Quiz', duration: '10:00', type: 'quiz' },
    ],
  },
  {
    id: 'SEC002',
    title: 'Core Concepts & Principles',
    lessons: [
      { id: 'L004', title: 'Foundational Theory', duration: '12:00', type: 'video' },
      { id: 'L005', title: 'Key Terminology', duration: '8:45', type: 'video' },
      { id: 'L006', title: 'Case Study Analysis', duration: '15:30', type: 'document' },
      { id: 'L007', title: 'Principles in Practice', duration: '10:20', type: 'video' },
      { id: 'L008', title: 'Knowledge Check', duration: '5:00', type: 'quiz' },
    ],
  },
  {
    id: 'SEC003',
    title: 'Hands-On Practical Exercise',
    lessons: [
      { id: 'L009', title: 'Exercise Setup & Instructions', duration: '6:00', type: 'video' },
      { id: 'L010', title: 'Guided Practice Session', duration: '20:00', type: 'video' },
      { id: 'L011', title: 'Independent Practice', duration: '30:00', type: 'assignment' },
      { id: 'L012', title: 'Debrief & Review', duration: '10:00', type: 'video' },
    ],
  },
  {
    id: 'SEC004',
    title: 'Field Assessment & Scenarios',
    lessons: [
      { id: 'L013', title: 'Scenario Briefing', duration: '8:00', type: 'video' },
      { id: 'L014', title: 'Scenario 1: Standard Response', duration: '25:00', type: 'assignment' },
      { id: 'L015', title: 'Scenario 2: Complex Situation', duration: '35:00', type: 'assignment' },
      { id: 'L016', title: 'After-Action Review', duration: '12:00', type: 'video' },
    ],
  },
  {
    id: 'SEC005',
    title: 'Advanced Techniques',
    lessons: [
      { id: 'L017', title: 'Advanced Method Overview', duration: '15:00', type: 'video' },
      { id: 'L018', title: 'Technique Demonstration', duration: '18:00', type: 'video' },
      { id: 'L019', title: 'Practice Drill', duration: '25:00', type: 'assignment' },
    ],
  },
  {
    id: 'SEC006',
    title: 'Case Studies & Analysis',
    lessons: [
      { id: 'L020', title: 'Case Study 1', duration: '12:00', type: 'document' },
      { id: 'L021', title: 'Case Study 2', duration: '14:00', type: 'document' },
      { id: 'L022', title: 'Discussion & Analysis', duration: '10:00', type: 'video' },
    ],
  },
  {
    id: 'SEC007',
    title: 'Final Assessment',
    lessons: [
      { id: 'L023', title: 'Review & Preparation', duration: '10:00', type: 'video' },
      { id: 'L024', title: 'Final Written Exam', duration: '45:00', type: 'quiz' },
      { id: 'L025', title: 'Practical Evaluation', duration: '30:00', type: 'assignment' },
    ],
  },
  {
    id: 'SEC008',
    title: 'Certification & Wrap-up',
    lessons: [
      { id: 'L026', title: 'Course Summary', duration: '8:00', type: 'video' },
      { id: 'L027', title: 'Certificate Requirements', duration: '5:00', type: 'document' },
      { id: 'L028', title: 'Next Steps & Resources', duration: '6:00', type: 'video' },
    ],
  },
];

function getLessonIcon(type: string) {
  switch (type) {
    case 'video': return <Video className="w-4 h-4 text-gray-500" />;
    case 'document': return <FileText className="w-4 h-4 text-gray-500" />;
    case 'assignment': return <ClipboardList className="w-4 h-4 text-gray-500" />;
    case 'quiz': return <HelpCircle className="w-4 h-4 text-gray-500" />;
    default: return <BookOpen className="w-4 h-4 text-gray-500" />;
  }
}

function calculateSectionDuration(lessons: { duration: string }[]) {
  let totalMinutes = 0;
  for (const lesson of lessons) {
    const parts = lesson.duration.split(':');
    totalMinutes += parseInt(parts[0]) + (parseInt(parts[1]) || 0) / 60;
  }
  if (totalMinutes >= 60) {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return `${hrs}hr ${mins}min`;
  }
  return `${Math.round(totalMinutes)}min`;
}

const totalLectures = curriculumSections.reduce((acc, s) => acc + s.lessons.length, 0);
const totalDuration = (() => {
  let totalMinutes = 0;
  for (const section of curriculumSections) {
    for (const lesson of section.lessons) {
      const parts = lesson.duration.split(':');
      totalMinutes += parseInt(parts[0]) + (parseInt(parts[1]) || 0) / 60;
    }
  }
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return `${hrs}h ${mins}m`;
})();

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const toggleAllSections = () => {
    if (expandedSections.length === curriculumSections.length) {
      setExpandedSections([]);
    } else {
      setExpandedSections(curriculumSections.map((s) => s.id));
    }
  };

  const handlePurchase = () => {
    setShowPurchaseModal(false);
    toast.success('Enrollment successful! You can now start learning.');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-700 rounded-xl p-6 text-white">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.enrollmentCount} enrolled</span>
          <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold-500" /> {course.rating}/5</span>
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {course.modules} modules · {course.lessons} lessons</span>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Curriculum Accordion */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Course content</h2>
            <button
              onClick={toggleAllSections}
              className="text-sm font-medium text-navy-800 hover:text-navy-600 transition-colors"
            >
              {expandedSections.length === curriculumSections.length ? 'Collapse all sections' : 'Expand all sections'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {curriculumSections.length} sections · {totalLectures} lectures · {totalDuration} total length
          </p>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {curriculumSections.map((section) => {
              const isExpanded = expandedSections.includes(section.id);
              return (
                <div key={section.id} className="border-b border-gray-200 last:border-b-0">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm font-semibold text-gray-900">{section.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {section.lessons.length} lectures · {calculateSectionDuration(section.lessons)}
                    </span>
                  </button>

                  {/* Section Lessons */}
                  {isExpanded && (
                    <div className="bg-white">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 px-6 py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          {getLessonIcon(lesson.type)}
                          <span className="flex-1 text-sm text-gray-700">{lesson.title}</span>
                          <span className="text-xs text-gray-500">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enroll Now Button */}
          <div className="mt-6">
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={() => setShowPurchaseModal(true)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Enroll Now · {course.price === 0 ? 'FREE' : `$${course.price.toLocaleString()}`}
            </Button>
          </div>
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
        </div>
      </div>

      {/* Purchase Modal */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Enroll in Course" size="md">
        <div className="space-y-6">
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

          <div className="space-y-3">
            <input type="text" placeholder="Card Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
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
