import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, GraduationCap, Clock, Users, DollarSign,
  CheckCircle, Play, ShoppingCart, CreditCard, Award,
  Calendar, Lock, BookOpen, FileText, Video, ClipboardList,
  MapPin, ChevronDown, ChevronRight, Image, Music
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { programService } from '@/services/programService';
import toast from 'react-hot-toast';

export function ProgramDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [learningStarted, setLearningStarted] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'modules' | 'sessions' | 'assessments' | 'media'>('modules');

  const program = programService.getById(id || '');

  if (!program) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Program not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/programs')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Programs
        </Button>
      </div>
    );
  }

  const totalLessons = program.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handlePurchase = () => {
    setShowPurchaseModal(false);
    setEnrolled(true);
    toast.success('Enrollment successful! You can now start the program.');
  };

  const handleStartLearning = () => {
    setLearningStarted(true);
    toast.success('Welcome to the program! Starting now.');
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-500" />;
      case 'document': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'assignment': return <ClipboardList className="w-4 h-4 text-purple-500" />;
      case 'quiz': return <ClipboardList className="w-4 h-4 text-green-500" />;
      default: return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-500" />;
      case 'document': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'image': return <Image className="w-4 h-4 text-green-500" />;
      case 'audio': return <Music className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const tabs = [
    { key: 'modules' as const, label: 'Modules', count: program.modules.length },
    { key: 'sessions' as const, label: 'Sessions', count: program.sessions.length },
    { key: 'assessments' as const, label: 'Assessments', count: program.assessments.length },
    { key: 'media' as const, label: 'Media', count: program.media.length },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/programs')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Programs
      </button>

      {/* Program Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-700 rounded-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="gold">{program.category}</Badge>
              <Badge variant={program.status === 'published' ? 'success' : 'warning'}>{program.status}</Badge>
              {program.level && <Badge variant="info">{program.level}</Badge>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold">{program.title}</h1>
            <p className="text-gray-300 max-w-2xl">{program.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {program.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {program.enrollmentCount} enrolled</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {program.modules.length} modules</span>
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {totalLessons} lessons</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {program.startDate}</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 min-w-[260px] text-center">
            <p className="text-3xl font-bold text-gold-500 mb-1">
              ${program.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-300 mb-4">Full program access</p>

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
                <Play className="w-4 h-4 mr-2" /> Start Program
              </Button>
            ) : (
              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={() => toast.success('Continuing program...')}
              >
                <Play className="w-4 h-4 mr-2" /> Continue Program
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

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress (shown when enrolled) */}
          {enrolled && (
            <Card>
              <CardHeader><CardTitle>Program Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Not started</span>
                  <span className="text-sm font-bold text-navy-800">0%</span>
                </div>
                <ProgressBar value={0} color="gold" size="lg" />
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Card>
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-gold-500 text-navy-800'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
            <CardContent className="pt-4">
              {/* Modules Tab */}
              {activeTab === 'modules' && (
                <div className="space-y-3">
                  {program.modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-navy-800/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-navy-800" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{module.title}</p>
                            <p className="text-xs text-gray-500">{module.lessons.length} lessons</p>
                          </div>
                        </div>
                        {expandedModules.includes(module.id)
                          ? <ChevronDown className="w-4 h-4 text-gray-400" />
                          : <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                      {expandedModules.includes(module.id) && (
                        <div className="border-t border-gray-100 bg-gray-50/50">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0">
                              {getLessonIcon(lesson.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-700 truncate">{lesson.title}</p>
                              </div>
                              <span className="text-xs text-gray-500">{lesson.duration}</span>
                              <Badge variant="gold" className="text-[10px]">{lesson.type}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-3">
                  {program.sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No sessions scheduled</p>
                  ) : (
                    program.sessions.map((session) => (
                      <div key={session.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{session.title}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{session.date}</span>
                            <span>{session.startTime} - {session.endTime}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {session.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>Instructor: {session.instructorName}</span>
                            <span>{session.attendees}/{session.capacity} attendees</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={session.status === 'completed' ? 'success' : session.status === 'in_progress' ? 'warning' : 'info'}>
                            {session.status}
                          </Badge>
                          <Badge variant="gold" className="text-[10px]">{session.type.replace('_', ' ')}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Assessments Tab */}
              {activeTab === 'assessments' && (
                <div className="space-y-3">
                  {program.assessments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No assessments available</p>
                  ) : (
                    program.assessments.map((assessment) => (
                      <div key={assessment.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <ClipboardList className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{assessment.questions} questions</span>
                            <span>{assessment.duration} min</span>
                            <span>Pass: {assessment.passingScore}%</span>
                            <span>{assessment.attempts} attempts</span>
                          </div>
                        </div>
                        <Badge variant={assessment.type === 'exam' ? 'danger' : assessment.type === 'quiz' ? 'info' : 'warning'}>
                          {assessment.type}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <div className="space-y-3">
                  {program.media.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No media available</p>
                  ) : (
                    program.media.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          {getMediaIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.size}</p>
                        </div>
                        <Badge variant="gold" className="text-[10px]">{item.type}</Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Program Details</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Duration</span>
                  <span className="text-sm font-medium">{program.duration}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Level</span>
                  <span className="text-sm font-medium">{program.level}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Modules</span>
                  <span className="text-sm font-medium">{program.modules.length}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><FileText className="w-4 h-4" /> Lessons</span>
                  <span className="text-sm font-medium">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" /> Enrolled</span>
                  <span className="text-sm font-medium">{program.enrollmentCount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start</span>
                  <span className="text-sm font-medium">{program.startDate}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> End</span>
                  <span className="text-sm font-medium">{program.endDate}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500 flex items-center gap-2"><Award className="w-4 h-4" /> Certificate</span>
                  <span className="text-sm font-medium text-green-600">Included</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {program.tags && program.tags.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {program.tags.map((tag) => (
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
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Enroll in Program" size="md">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">{program.title}</span>
              <span className="text-sm font-medium">${program.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm font-medium">$0.00</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-navy-800">${program.price.toLocaleString()}</span>
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
              <Lock className="w-4 h-4 mr-1" /> Pay ${program.price.toLocaleString()}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
