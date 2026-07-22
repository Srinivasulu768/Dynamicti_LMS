import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Users, DollarSign,
  ShoppingCart, CreditCard, Award,
  Calendar, Lock, BookOpen, FileText, Video, ClipboardList,
  ChevronDown, ChevronUp, BarChart3, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { programService } from '@/services/programService';
import toast from 'react-hot-toast';

function getLessonIcon(type: string) {
  switch (type) {
    case 'video': return <Video className="w-4 h-4 text-gray-500" />;
    case 'document': return <FileText className="w-4 h-4 text-gray-500" />;
    case 'assignment': return <ClipboardList className="w-4 h-4 text-gray-500" />;
    case 'quiz': return <HelpCircle className="w-4 h-4 text-gray-500" />;
    default: return <BookOpen className="w-4 h-4 text-gray-500" />;
  }
}

function calculateModuleDuration(lessons: { duration: string }[]) {
  let totalMinutes = 0;
  for (const lesson of lessons) {
    const match = lesson.duration.match(/(\d+)/);
    if (match) {
      totalMinutes += parseInt(match[1]);
    }
  }
  if (totalMinutes >= 60) {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}hr ${mins}min`;
  }
  return `${totalMinutes}min`;
}

export function ProgramDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

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

  const totalProgramDuration = (() => {
    let totalMinutes = 0;
    for (const mod of program.modules) {
      for (const lesson of mod.lessons) {
        const match = lesson.duration.match(/(\d+)/);
        if (match) totalMinutes += parseInt(match[1]);
      }
    }
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  })();

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const toggleAllModules = () => {
    if (expandedModules.length === program.modules.length) {
      setExpandedModules([]);
    } else {
      setExpandedModules(program.modules.map((m) => m.id));
    }
  };

  const handlePurchase = () => {
    setShowPurchaseModal(false);
    toast.success('Enrollment successful! You can now start the program.');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Program Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-700 rounded-xl p-6 text-white">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {program.duration}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {program.enrollmentCount} enrolled</span>
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {program.modules.length} modules</span>
          <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {totalLessons} lessons</span>
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {program.startDate}</span>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Curriculum Accordion */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Course content</h2>
            <button
              onClick={toggleAllModules}
              className="text-sm font-medium text-navy-800 hover:text-navy-600 transition-colors"
            >
              {expandedModules.length === program.modules.length ? 'Collapse all sections' : 'Expand all sections'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {program.modules.length} sections · {totalLessons} lectures · {totalProgramDuration} total length
          </p>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {program.modules.map((module) => {
              const isExpanded = expandedModules.includes(module.id);
              return (
                <div key={module.id} className="border-b border-gray-200 last:border-b-0">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm font-semibold text-gray-900">{module.title}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {module.lessons.length} lectures · {calculateModuleDuration(module.lessons)}
                    </span>
                  </button>

                  {/* Module Lessons */}
                  {isExpanded && (
                    <div className="bg-white">
                      {module.lessons.map((lesson) => (
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
              <ShoppingCart className="w-4 h-4 mr-2" /> Enroll Now · ${program.price.toLocaleString()}
            </Button>
          </div>
        </div>

        {/* Sidebar - Program Details */}
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
                  <span className="text-sm text-gray-500 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Level</span>
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
