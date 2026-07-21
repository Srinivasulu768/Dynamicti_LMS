import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FilterBar } from '@/components/ui/FilterBar';
import { enrollmentService } from '@/services/enrollmentService';
import type { Enrollment } from '@/types';

const statusColors: Record<string, 'success' | 'info' | 'warning' | 'default' | 'danger'> = {
  completed: 'success', in_progress: 'info', enrolled: 'warning', dropped: 'danger', waitlisted: 'default',
};

export function EnrollmentsPage() {
  const enrollments = enrollmentService.getAll();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => enrollments.filter(e => {
    const matchSearch = !search || e.userName.toLowerCase().includes(search.toLowerCase()) || e.courseName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || filters.status === 'all' || e.status === filters.status;
    return matchSearch && matchStatus;
  }), [enrollments, search, filters]);

  const columns = [
    { key: 'userName', label: 'Learner', render: (e: Enrollment) => <span className="font-medium text-gray-900">{e.userName}</span> },
    { key: 'courseName', label: 'Course' },
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
      <p className="text-sm text-gray-500">{filtered.length} total enrollments</p>

      <FilterBar
        searchPlaceholder="Search by learner or course..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'status', placeholder: 'All Status', options: [{ value: 'enrolled', label: 'Enrolled' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'dropped', label: 'Dropped' }, { value: 'waitlisted', label: 'Waitlisted' }] },
        ]}
      />

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} pageSize={10} searchable={false} />
    </motion.div>
  );
}
