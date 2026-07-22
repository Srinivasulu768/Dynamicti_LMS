import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { assessmentService } from '@/services/assessmentService';
import { getCourses } from '@/services/courseService';
import { programService } from '@/services/programService';
import type { Assessment, ParentType } from '@/types';
import toast from 'react-hot-toast';

export function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>(assessmentService.getAll);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  const courses = getCourses();
  const programs = programService.getAll();
  const refresh = () => setAssessments(assessmentService.getAll());

  const filtered = useMemo(() => assessments.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.courseName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || filters.status === 'all' || a.status === filters.status;
    const matchType = !filters.type || filters.type === 'all' || a.type === filters.type;
    const matchParent = !filters.parentType || filters.parentType === 'all' || a.parentType === filters.parentType;
    return matchSearch && matchStatus && matchType && matchParent;
  }), [assessments, search, filters]);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const parentType = formData.get('parentType') as ParentType;
    const parentId = formData.get('parentId') as string;
    const parent = parentType === 'course'
      ? courses.find(c => c.id === parentId)
      : programs.find(p => p.id === parentId);

    if (!parent) {
      toast.error('Please select a valid parent');
      return;
    }

    assessmentService.create({
      title: formData.get('title') as string,
      courseId: parentId,
      courseName: parent.title,
      parentType,
      type: formData.get('type') as Assessment['type'],
      questions: Number(formData.get('questions')) || 10,
      duration: Number(formData.get('duration')) || 30,
      passingScore: Number(formData.get('passingScore')) || 70,
      attempts: Number(formData.get('attempts')) || 3,
      status: 'draft',
    } as Omit<Assessment, 'id'>);
    refresh();
    setShowCreateModal(false);
    toast.success('Assessment created!');
  };

  const quizzes = assessments.filter(a => a.type === 'quiz').length;
  const exams = assessments.filter(a => a.type === 'exam').length;
  const assignments = assessments.filter(a => a.type === 'assignment').length;

  const columns = [
    { key: 'title', label: 'Title', render: (a: Assessment) => <span className="font-medium">{a.title}</span> },
    { key: 'courseName', label: 'Parent', render: (a: Assessment) => (
      <div>
        <span className="text-sm">{a.courseName}</span>
        <Badge variant={a.parentType === 'course' ? 'info' : 'default'} className="ml-2 text-[10px]">{a.parentType}</Badge>
      </div>
    )},
    { key: 'type', label: 'Type', render: (a: Assessment) => <Badge variant="gold">{a.type}</Badge> },
    { key: 'questions', label: 'Questions' },
    { key: 'duration', label: 'Duration', render: (a: Assessment) => `${a.duration} min` },
    { key: 'passingScore', label: 'Pass Score', render: (a: Assessment) => `${a.passingScore}%` },
    { key: 'attempts', label: 'Attempts' },
    { key: 'status', label: 'Status', render: (a: Assessment) => (
      <Badge variant={a.status === 'published' ? 'success' : a.status === 'draft' ? 'warning' : 'default'}>{a.status}</Badge>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} assessments</p>
        <PermissionGate module="Assessments" action="create">
          <Button onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4 mr-1" /> Create Assessment</Button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total" value={assessments.length} icon={ClipboardCheck} />
        <StatsCard title="Quizzes" value={quizzes} icon={ClipboardCheck} />
        <StatsCard title="Exams" value={exams} icon={ClipboardCheck} />
        <StatsCard title="Assignments" value={assignments} icon={ClipboardCheck} />
      </div>

      <FilterBar
        searchPlaceholder="Search assessments..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'type', placeholder: 'All Types', options: [{ value: 'quiz', label: 'Quiz' }, { value: 'exam', label: 'Exam' }, { value: 'assignment', label: 'Assignment' }] },
          { key: 'status', placeholder: 'All Status', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }] },
          { key: 'parentType', placeholder: 'All Parents', options: [{ value: 'course', label: 'Course' }, { value: 'program', label: 'Program' }] },
        ]}
      />

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} pageSize={10} searchable={false} />

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Assessment" size="lg">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Input label="Assessment Title *" name="title" placeholder="Enter assessment title" required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type *</label>
              <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Belongs To *</label>
              <select name="parentType" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="course">Course</option>
                <option value="program">Program</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Select Parent *</label>
            <select name="parentId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
              <option value="">Select...</option>
              <optgroup label="Courses">
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </optgroup>
              <optgroup label="Programs">
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Input label="Questions" name="questions" type="number" placeholder="10" defaultValue={10} />
            <Input label="Duration (min)" name="duration" type="number" placeholder="30" defaultValue={30} />
            <Input label="Pass Score (%)" name="passingScore" type="number" placeholder="70" defaultValue={70} />
            <Input label="Attempts" name="attempts" type="number" placeholder="3" defaultValue={3} />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit">Create Assessment</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
