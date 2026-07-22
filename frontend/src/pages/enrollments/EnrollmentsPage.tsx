import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, UserPlus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { enrollmentService } from '@/services/enrollmentService';
import { getCourses } from '@/services/courseService';
import { programService } from '@/services/programService';
import { loadUsers } from '@/services/userService';
import type { Enrollment, ParentType, User } from '@/types';
import toast from 'react-hot-toast';

const statusColors: Record<string, 'success' | 'info' | 'warning' | 'default' | 'danger'> = {
  completed: 'success', in_progress: 'info', enrolled: 'warning', dropped: 'danger', waitlisted: 'default',
};

export function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(enrollmentService.getAll);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Bulk enrollment state
  const [bulkSelectedUsers, setBulkSelectedUsers] = useState<string[]>([]);
  const [bulkParentType, setBulkParentType] = useState<ParentType>('course');
  const [bulkParentId, setBulkParentId] = useState('');
  const [bulkSearch, setBulkSearch] = useState('');

  const courses = getCourses().filter(c => c.status === 'published');
  const programs = programService.getAll().filter(p => p.status === 'published');
  const learners = (loadUsers() as User[]).filter(u => u.role === 'learner' && u.status === 'active');
  const refresh = () => setEnrollments(enrollmentService.getAll());

  const filtered = useMemo(() => enrollments.filter(e => {
    const matchSearch = !search || e.userName.toLowerCase().includes(search.toLowerCase()) || e.courseName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || filters.status === 'all' || e.status === filters.status;
    const matchParent = !filters.parentType || filters.parentType === 'all' || e.parentType === filters.parentType;
    return matchSearch && matchStatus && matchParent;
  }), [enrollments, search, filters]);

  // Single enroll
  const handleEnroll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userId = formData.get('userId') as string;
    const parentType = formData.get('parentType') as ParentType;
    const parentId = formData.get('parentId') as string;
    const user = learners.find(u => u.id === userId);
    const parent = parentType === 'course'
      ? courses.find(c => c.id === parentId)
      : programs.find(p => p.id === parentId);

    if (!user || !parent) {
      toast.error('Please select a valid learner and course/program');
      return;
    }

    const result = enrollmentService.enroll(
      userId,
      `${user.firstName} ${user.lastName}`,
      parentType,
      parentId,
      parent.title
    );

    if (!result) {
      toast.error('User is already enrolled in this item');
      return;
    }

    refresh();
    setShowEnrollModal(false);
    toast.success(`Enrolled ${user.firstName} in "${parent.title}"!`);
  };

  // Bulk enroll
  const handleBulkEnroll = () => {
    if (bulkSelectedUsers.length === 0) {
      toast.error('Please select at least one learner');
      return;
    }
    if (!bulkParentId) {
      toast.error('Please select a course or program');
      return;
    }

    const parent = bulkParentType === 'course'
      ? courses.find(c => c.id === bulkParentId)
      : programs.find(p => p.id === bulkParentId);

    if (!parent) {
      toast.error('Invalid selection');
      return;
    }

    let enrolled = 0;
    let skipped = 0;

    bulkSelectedUsers.forEach(userId => {
      const user = learners.find(u => u.id === userId);
      if (!user) return;

      const result = enrollmentService.enroll(
        userId,
        `${user.firstName} ${user.lastName}`,
        bulkParentType,
        bulkParentId,
        parent.title
      );

      if (result) enrolled++;
      else skipped++;
    });

    refresh();
    setShowBulkModal(false);
    setBulkSelectedUsers([]);
    setBulkParentId('');
    setBulkSearch('');

    if (enrolled > 0 && skipped === 0) {
      toast.success(`Successfully enrolled ${enrolled} learner${enrolled > 1 ? 's' : ''} in "${parent.title}"!`);
    } else if (enrolled > 0 && skipped > 0) {
      toast.success(`Enrolled ${enrolled} learner${enrolled > 1 ? 's' : ''}. ${skipped} already enrolled (skipped).`);
    } else {
      toast.error('All selected learners are already enrolled.');
    }
  };

  const toggleUserSelection = (userId: string) => {
    setBulkSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const filteredLearners = learners.filter(l =>
      l.firstName.toLowerCase().includes(bulkSearch.toLowerCase()) ||
      l.lastName.toLowerCase().includes(bulkSearch.toLowerCase()) ||
      l.email.toLowerCase().includes(bulkSearch.toLowerCase()) ||
      (l.organization || '').toLowerCase().includes(bulkSearch.toLowerCase())
    );
    if (bulkSelectedUsers.length === filteredLearners.length) {
      setBulkSelectedUsers([]);
    } else {
      setBulkSelectedUsers(filteredLearners.map(l => l.id));
    }
  };

  const filteredLearners = learners.filter(l =>
    l.firstName.toLowerCase().includes(bulkSearch.toLowerCase()) ||
    l.lastName.toLowerCase().includes(bulkSearch.toLowerCase()) ||
    l.email.toLowerCase().includes(bulkSearch.toLowerCase()) ||
    (l.organization || '').toLowerCase().includes(bulkSearch.toLowerCase())
  );

  const columns = [
    { key: 'userName', label: 'Learner', render: (e: Enrollment) => <span className="font-medium text-gray-900">{e.userName}</span> },
    { key: 'courseName', label: 'Course/Program', render: (e: Enrollment) => (
      <div>
        <span className="text-sm">{e.courseName}</span>
        <Badge variant={e.parentType === 'course' ? 'info' : 'default'} className="ml-2 text-[10px]">{e.parentType}</Badge>
      </div>
    )},
    {
      key: 'progress', label: 'Progress',
      render: (e: Enrollment) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <ProgressBar value={e.progress} size="sm" color={e.progress === 100 ? 'green' : 'navy'} className="flex-1" />
          <span className="text-xs font-medium text-gray-500">{e.progress}%</span>
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (e: Enrollment) => <Badge variant={statusColors[e.status]}>{e.status.replace('_', ' ')}</Badge> },
    { key: 'enrolledDate', label: 'Enrolled' },
    { key: 'grade', label: 'Grade', render: (e: Enrollment) => e.grade || '—' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} total enrollments</p>
        <div className="flex gap-2">
          <PermissionGate module="Enrollments" action="create">
            <Button variant="outline" onClick={() => setShowBulkModal(true)}>
              <Users className="w-4 h-4 mr-1" /> Bulk Enroll
            </Button>
          </PermissionGate>
          <PermissionGate module="Enrollments" action="create">
            <Button onClick={() => setShowEnrollModal(true)}>
              <UserPlus className="w-4 h-4 mr-1" /> Enroll Learner
            </Button>
          </PermissionGate>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Search by learner or course..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'status', placeholder: 'All Status', options: [{ value: 'enrolled', label: 'Enrolled' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'dropped', label: 'Dropped' }] },
          { key: 'parentType', placeholder: 'All Types', options: [{ value: 'course', label: 'Course' }, { value: 'program', label: 'Program' }] },
        ]}
      />

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} pageSize={10} searchable={false} />

      {/* Single Enroll Modal */}
      <Modal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} title="Enroll Learner" size="lg">
        <form className="space-y-4" onSubmit={handleEnroll}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Learner *</label>
            <select name="userId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
              <option value="">Select learner</option>
              {learners.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} — {l.organization || 'No org'}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Enroll In *</label>
              <select name="parentType" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="course">Course</option>
                <option value="program">Program</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select *</label>
              <select name="parentId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="">Select...</option>
                <optgroup label="Published Courses">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </optgroup>
                <optgroup label="Published Programs">
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </optgroup>
              </select>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">Only <strong>published</strong> courses and programs are shown. The learner will gain immediate access to the enrolled content.</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowEnrollModal(false)}>Cancel</Button>
            <Button type="submit">Enroll</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Enroll Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => { setShowBulkModal(false); setBulkSelectedUsers([]); setBulkSearch(''); }}
        title="Bulk Enroll Learners"
        size="xl"
      >
        <div className="space-y-4">
          {/* Step 1: Select Course/Program */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Enroll In *</label>
              <select
                value={bulkParentType}
                onChange={(e) => { setBulkParentType(e.target.value as ParentType); setBulkParentId(''); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="course">Course</option>
                <option value="program">Program</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select {bulkParentType === 'course' ? 'Course' : 'Program'} *</label>
              <select
                value={bulkParentId}
                onChange={(e) => setBulkParentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select...</option>
                {bulkParentType === 'course'
                  ? courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
                  : programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)
                }
              </select>
            </div>
          </div>

          {/* Step 2: Select Learners */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Select Learners * <span className="text-gray-400 font-normal">({bulkSelectedUsers.length} selected)</span>
              </label>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-medium text-navy-800 hover:text-navy-600 transition-colors"
              >
                {bulkSelectedUsers.length === filteredLearners.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Search learners */}
            <input
              type="text"
              placeholder="Search learners by name, email, or organization..."
              value={bulkSearch}
              onChange={(e) => setBulkSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20"
            />

            {/* Learner list with checkboxes */}
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {filteredLearners.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No learners found</p>
              ) : (
                filteredLearners.map((learner) => {
                  const isSelected = bulkSelectedUsers.includes(learner.id);
                  const alreadyEnrolled = bulkParentId ? enrollmentService.isEnrolled(learner.id, bulkParentId) : false;

                  return (
                    <label
                      key={learner.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                        alreadyEnrolled
                          ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-navy-800/5'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-navy-800 border-navy-800'
                              : 'border-gray-300'
                          } ${alreadyEnrolled ? 'opacity-50' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!alreadyEnrolled) toggleUserSelection(learner.id);
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => { if (!alreadyEnrolled) toggleUserSelection(learner.id); }}>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {learner.firstName} {learner.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {learner.email} {learner.organization && `· ${learner.organization}`}
                        </p>
                      </div>
                      {alreadyEnrolled && (
                        <Badge variant="default" className="text-[10px] flex-shrink-0">Already Enrolled</Badge>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Summary */}
          {bulkSelectedUsers.length > 0 && bulkParentId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700">
                <strong>{bulkSelectedUsers.length}</strong> learner{bulkSelectedUsers.length > 1 ? 's' : ''} will be enrolled in{' '}
                <strong>
                  {bulkParentType === 'course'
                    ? courses.find(c => c.id === bulkParentId)?.title
                    : programs.find(p => p.id === bulkParentId)?.title
                  }
                </strong>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => { setShowBulkModal(false); setBulkSelectedUsers([]); setBulkSearch(''); }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkEnroll}
              disabled={bulkSelectedUsers.length === 0 || !bulkParentId}
            >
              <Users className="w-4 h-4 mr-1" />
              Enroll {bulkSelectedUsers.length > 0 ? `${bulkSelectedUsers.length} Learner${bulkSelectedUsers.length > 1 ? 's' : ''}` : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
