import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, Play, Lock, Clock, Video, FileText,
  ChevronDown, ChevronRight, BookOpen, ClipboardCheck, Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { enrollmentService } from '@/services/enrollmentService';
import { contentService } from '@/services/contentService';
import { assessmentService } from '@/services/assessmentService';
import { certificateService } from '@/services/certificateService';
import { certificateTemplateService } from '@/services/certificateTemplateService';
import { useAuth } from '@/contexts/AuthContext';
import type { ContentItem, Assessment } from '@/types';
import toast from 'react-hot-toast';

export function LearningPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const enrollment = enrollmentService.getById(id || '');
  const [activeLesson, setActiveLesson] = useState<ContentItem | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!enrollment) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Enrollment not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/my-learning')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Learning
        </Button>
      </div>
    );
  }

  const content = contentService.getByParent(enrollment.parentType, enrollment.courseId);
  const modules = content.filter(c => c.contentType === 'module').sort((a, b) => a.order - b.order);
  const allLessons = content.filter(c => c.contentType !== 'module').sort((a, b) => a.order - b.order);
  const assessments = assessmentService.getByParent(enrollment.parentType, enrollment.courseId);

  // Group lessons by module
  const getLessonsForModule = (moduleId: string) =>
    allLessons.filter(l => l.moduleId === moduleId).sort((a, b) => a.order - b.order);

  // Lessons not in any module
  const standaloneLessons = allLessons.filter(l => !l.moduleId);

  // All ordered items for progress calculation
  const allItems = modules.length > 0
    ? modules.flatMap(m => getLessonsForModule(m.id))
    : standaloneLessons;

  const completedCount = allItems.filter(i => i.status === 'published').length;
  const progress = allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : enrollment.progress;

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    );
  };

  const isLessonAccessible = (lesson: ContentItem, index: number, lessonsList: ContentItem[]) => {
    if (lesson.status === 'published') return true; // completed
    // First incomplete item is accessible
    const firstIncompleteIdx = lessonsList.findIndex(l => l.status !== 'published');
    return index === firstIncompleteIdx;
  };

  const handleMarkComplete = (lesson: ContentItem) => {
    contentService.update(lesson.id, { status: 'published', updatedDate: new Date().toISOString().split('T')[0] });

    // Recalculate progress
    const updatedContent = contentService.getByParent(enrollment.parentType, enrollment.courseId);
    const updatedLessons = updatedContent.filter(c => c.contentType !== 'module');
    const newCompleted = updatedLessons.filter(l => l.status === 'published').length;
    const newProgress = updatedLessons.length > 0 ? Math.round((newCompleted / updatedLessons.length) * 100) : 0;

    enrollmentService.updateProgress(enrollment.id, newProgress);

    // Check if completed — auto-generate certificate
    if (newProgress >= 100) {
      const template = certificateTemplateService.getByParent(enrollment.parentType, enrollment.courseId);
      if (template && user && !certificateService.hasActiveCertificate(user.id, enrollment.courseId)) {
        certificateService.generate(
          user.id,
          `${user.firstName} ${user.lastName}`,
          enrollment.parentType,
          enrollment.courseId,
          enrollment.courseName,
          template.id,
          template.validityMonths
        );
        toast.success('🎉 Congratulations! Course completed! Certificate generated!', { duration: 5000 });
      } else {
        toast.success('🎉 Congratulations! You completed this course!', { duration: 4000 });
      }
    } else {
      toast.success('Lesson complete!');
    }

    setActiveLesson(null);
    setRefreshKey(prev => prev + 1);
  };

  const currentProgress = allItems.length > 0
    ? Math.round((allItems.filter(i => i.status === 'published').length / allItems.length) * 100)
    : enrollment.progress;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[calc(100vh-56px)] flex flex-col" key={refreshKey}>
      {/* Top Bar */}
      <div className="bg-navy-900 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/my-learning')}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to My Learning
            </button>
            <div className="h-5 w-px bg-navy-700" />
            <div>
              <h1 className="text-lg font-bold">{enrollment.courseName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="gold" className="text-[10px]">{enrollment.parentType}</Badge>
                <span className="text-xs text-gray-400">{completedCount}/{allItems.length} lessons complete</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{currentProgress}%</p>
              <p className="text-xs text-gray-400">Progress</p>
            </div>
            <div className="w-32">
              <ProgressBar value={currentProgress} color="gold" size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content — Udemy-style layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — Curriculum */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Course Content</h2>
            <p className="text-xs text-gray-500 mt-1">{allItems.length} lessons · {assessments.length} assessments</p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Modules with nested lessons */}
            {modules.length > 0 ? (
              modules.map((module) => {
                const moduleLessons = getLessonsForModule(module.id);
                const moduleCompleted = moduleLessons.filter(l => l.status === 'published').length;
                const isExpanded = expandedModules.includes(module.id);

                return (
                  <div key={module.id}>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">{module.title}</p>
                        <p className="text-xs text-gray-500">{moduleCompleted}/{moduleLessons.length} complete</p>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="bg-gray-50/50">
                        {moduleLessons.map((lesson, idx) => {
                          const accessible = isLessonAccessible(lesson, idx, moduleLessons);
                          const isActive = activeLesson?.id === lesson.id;
                          const isCompleted = lesson.status === 'published';

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => accessible ? setActiveLesson(lesson) : toast('Complete previous lessons first', { icon: '🔒' })}
                              className={`w-full flex items-center gap-3 px-6 py-2.5 text-left transition-colors ${
                                isActive ? 'bg-gold-500/10 border-l-2 border-gold-500' :
                                isCompleted ? 'hover:bg-green-50' :
                                accessible ? 'hover:bg-gray-100' : 'opacity-50'
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : accessible ? (
                                  <Play className="w-4 h-4 text-gold-500" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">{lesson.title}</p>
                                <p className="text-[10px] text-gray-500">{lesson.duration || lesson.contentType}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              /* Standalone lessons (no modules) */
              standaloneLessons.map((lesson, idx) => {
                const accessible = isLessonAccessible(lesson, idx, standaloneLessons);
                const isActive = activeLesson?.id === lesson.id;
                const isCompleted = lesson.status === 'published';

                return (
                  <button
                    key={lesson.id}
                    onClick={() => accessible ? setActiveLesson(lesson) : toast('Complete previous lessons first', { icon: '🔒' })}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isActive ? 'bg-gold-500/10 border-l-2 border-gold-500' :
                      isCompleted ? 'hover:bg-green-50' :
                      accessible ? 'hover:bg-gray-100' : 'opacity-50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : accessible ? (
                        <Play className="w-4 h-4 text-gold-500" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {lesson.duration && <><Clock className="w-3 h-3" /> {lesson.duration}</>}
                        <span className="capitalize">{lesson.contentType}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}

            {/* Assessments Section */}
            {assessments.length > 0 && (
              <div className="border-t border-gray-200">
                <div className="px-4 py-3 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardCheck className="w-3.5 h-3.5" /> Assessments
                  </p>
                </div>
                {assessments.map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                    <ClipboardCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{a.title}</p>
                      <p className="text-[10px] text-gray-500">{a.type} · {a.questions}q · {a.duration}min</p>
                    </div>
                    <Badge variant={a.status === 'published' ? 'success' : 'warning'} className="text-[9px]">{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main — Content Player */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {activeLesson ? (
            <div className="h-full flex flex-col">
              {/* Video/Content Area */}
              <div className="flex-1 flex items-center justify-center p-8">
                {activeLesson.contentType === 'video' ? (
                  <div className="w-full max-w-4xl">
                    <div className="bg-black rounded-xl aspect-video flex items-center justify-center relative shadow-2xl">
                      <div className="text-center">
                        <div
                          className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors"
                          onClick={() => toast.success('Video playing...')}
                        >
                          <Play className="w-12 h-12 text-white ml-1" />
                        </div>
                        <p className="text-white/60 text-sm">Click to play</p>
                      </div>
                      {activeLesson.duration && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-between">
                            <span className="text-white text-xs">0:00</span>
                            <div className="flex-1 mx-4 h-1.5 bg-white/20 rounded-full">
                              <div className="h-full w-0 bg-gold-500 rounded-full" />
                            </div>
                            <span className="text-white text-xs">{activeLesson.duration}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Lesson Info */}
                    <div className="mt-6">
                      <h2 className="text-xl font-bold text-gray-900">{activeLesson.title}</h2>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span className="capitalize">{activeLesson.contentType}</span>
                        {activeLesson.duration && <span>· {activeLesson.duration}</span>}
                      </div>
                      {activeLesson.description && (
                        <p className="text-sm text-gray-600 mt-3">{activeLesson.description}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-3xl">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                      {activeLesson.contentType === 'document' || activeLesson.contentType === 'pdf' ? (
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      ) : (
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      )}
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{activeLesson.title}</h2>
                      <p className="text-sm text-gray-500 mb-2 capitalize">{activeLesson.contentType} {activeLesson.duration && `· ${activeLesson.duration}`}</p>
                      {activeLesson.description && (
                        <p className="text-sm text-gray-600 mt-4">{activeLesson.description}</p>
                      )}
                      <p className="text-sm text-gray-400 mt-6">Read through the material and mark as complete when finished.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">{activeLesson.title}</span>
                  {activeLesson.duration && <span className="ml-2">· {activeLesson.duration}</span>}
                </div>
                <Button variant="gold" onClick={() => handleMarkComplete(activeLesson)}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark as Complete
                </Button>
              </div>
            </div>
          ) : (
            /* No lesson selected — welcome view */
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-navy-800/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-navy-800" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{enrollment.courseName}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {currentProgress === 0
                    ? 'Select a lesson from the sidebar to start learning.'
                    : currentProgress >= 100
                    ? 'You have completed this course! 🎉'
                    : 'Select a lesson from the sidebar to continue where you left off.'
                  }
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {allItems.length} lessons</span>
                  <span className="flex items-center gap-1"><ClipboardCheck className="w-4 h-4" /> {assessments.length} assessments</span>
                  <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Certificate</span>
                </div>
                {currentProgress >= 100 && (
                  <Button variant="gold" className="mt-6" onClick={() => navigate('/my-certificates')}>
                    <Award className="w-4 h-4 mr-2" /> View Certificate
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
