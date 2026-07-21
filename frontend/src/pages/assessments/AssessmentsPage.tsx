import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardCheck, Clock, Target, FileCheck, Eye, Edit, Trash2, Play, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FilterBar } from '@/components/ui/FilterBar';
import { GridPagination } from '@/components/ui/GridPagination';
import assessmentsData from '@/mock/assessments.json';
import type { Assessment } from '@/types';
import { PermissionGate } from '@/components/ui/PermissionGate';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export function AssessmentsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [assessments, setAssessments] = useState(assessmentsData as Assessment[]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = assessments.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.courseName.toLowerCase().includes(search.toLowerCase());
    const matchType = !filters.type || filters.type === 'all' || a.type === filters.type;
    const matchStatus = !filters.status || filters.status === 'all' || a.status === filters.status;
    return matchSearch && matchType && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const typeIcons: Record<string, typeof ClipboardCheck> = { quiz: ClipboardCheck, exam: FileCheck, assignment: Target };

  const handleDelete = () => {
    if (selectedAssessment) {
      setAssessments(assessments.filter(a => a.id !== selectedAssessment.id));
      setShowDeleteModal(false);
      setSelectedAssessment(null);
      toast.success('Assessment deleted!');
    }
  };

  const handleDuplicate = (assessment: Assessment) => {
    const duplicate = { ...assessment, id: `ASM${Date.now()}`, title: `${assessment.title} (Copy)`, status: 'draft' as const };
    setAssessments([duplicate, ...assessments]);
    toast.success('Assessment duplicated!');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} assessments</p>
        <PermissionGate module="Assessments" action="create">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Assessment
          </Button>
        </PermissionGate>
      </div>

      <FilterBar
        searchPlaceholder="Search assessments..."
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onFilterChange={(key, val) => { setFilters(prev => ({ ...prev, [key]: val })); setPage(1); }}
        filters={[
          { key: 'type', placeholder: 'All Types', options: [{ value: 'quiz', label: 'Quiz' }, { value: 'exam', label: 'Exam' }, { value: 'assignment', label: 'Assignment' }, { value: 'survey', label: 'Survey' }] },
          { key: 'status', placeholder: 'All Status', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map((assessment) => {
          const Icon = typeIcons[assessment.type] || ClipboardCheck;
          return (
            <Card key={assessment.id} hover>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-navy-800/5 rounded-lg"><Icon className="w-5 h-5 text-navy-800" /></div>
                <div className="flex gap-1">
                  <Badge variant={assessment.status === 'published' ? 'success' : 'warning'}>{assessment.status}</Badge>
                  <Badge variant="gold">{assessment.type}</Badge>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{assessment.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{assessment.courseName}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" /> {assessment.questions} questions</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {assessment.duration} min</span>
                <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Pass: {assessment.passingScore}%</span>
                <span className="flex items-center gap-1">Max attempts: {assessment.attempts}</span>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setSelectedAssessment(assessment); setShowViewModal(true); }}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-navy-800 bg-navy-800/5 hover:bg-navy-800/10 rounded-md transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button
                  onClick={() => { setSelectedAssessment(assessment); setShowPreviewModal(true); }}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => { setSelectedAssessment(assessment); setShowEditModal(true); }}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDuplicate(assessment)}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setSelectedAssessment(assessment); setShowDeleteModal(true); }}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <GridPagination totalItems={filtered.length} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />

      {/* Create Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Assessment" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Assessment created!'); setShowAddModal(false); }}>
          <Input label="Title" placeholder="Assessment title" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Network Security Fundamentals</option>
              <option>Advanced Cybersecurity Operations</option>
              <option>Project Management Professional</option>
              <option>Leadership & Strategic Management</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Quiz</option><option>Exam</option><option>Assignment</option><option>Survey</option>
              </select>
            </div>
            <Input label="Duration (min)" type="number" placeholder="60" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Number of Questions" type="number" placeholder="20" />
            <Input label="Passing Score (%)" type="number" placeholder="70" />
          </div>
          <Input label="Max Attempts" type="number" placeholder="3" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Assessment</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Assessment Details" size="md">
        {selectedAssessment && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={selectedAssessment.status === 'published' ? 'success' : 'warning'}>{selectedAssessment.status}</Badge>
              <Badge variant="gold">{selectedAssessment.type}</Badge>
            </div>
            <h3 className="text-lg font-semibold">{selectedAssessment.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Course</span><span className="font-medium">{selectedAssessment.courseName}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Questions</span><span className="font-medium">{selectedAssessment.questions}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Duration</span><span className="font-medium">{selectedAssessment.duration} min</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Passing Score</span><span className="font-medium">{selectedAssessment.passingScore}%</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Max Attempts</span><span className="font-medium">{selectedAssessment.attempts}</span></div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Assessment" size="lg">
        {selectedAssessment && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowEditModal(false); toast.success('Assessment updated!'); }}>
            <Input label="Title" defaultValue={selectedAssessment.title} required />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedAssessment.type}>
                  <option>quiz</option><option>exam</option><option>assignment</option><option>survey</option>
                </select>
              </div>
              <Input label="Duration (min)" type="number" defaultValue={String(selectedAssessment.duration)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Passing Score (%)" type="number" defaultValue={String(selectedAssessment.passingScore)} />
              <Input label="Max Attempts" type="number" defaultValue={String(selectedAssessment.attempts)} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={showPreviewModal} onClose={() => setShowPreviewModal(false)} title="Assessment Preview" size="lg">
        {selectedAssessment && (
          <div className="space-y-6">
            <div className="bg-navy-800/5 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900">{selectedAssessment.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedAssessment.questions} questions · {selectedAssessment.duration} minutes · Pass: {selectedAssessment.passingScore}%</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-3">Q1. What is the primary purpose of this training module?</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="q1" className="accent-navy-800" /> Option A - Demonstrate proper procedure</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="q1" className="accent-navy-800" /> Option B - Review existing protocols</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="q1" className="accent-navy-800" /> Option C - Assess situational awareness</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="q1" className="accent-navy-800" /> Option D - All of the above</label>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-3">Q2. Which of the following is the correct response protocol?</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="q2" className="accent-navy-800" /> Option A - Immediate escalation</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="q2" className="accent-navy-800" /> Option B - Assess and contain</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="q2" className="accent-navy-800" /> Option C - Report and wait</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="q2" className="accent-navy-800" /> Option D - None of the above</label>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">Preview shows sample questions only. Full assessment has {selectedAssessment.questions} questions.</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>Close Preview</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Assessment" size="sm">
        {selectedAssessment && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{selectedAssessment.title}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
