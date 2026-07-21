import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Grid3X3, List, BookOpen, Users, Clock, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FilterBar } from '@/components/ui/FilterBar';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { GridPagination } from '@/components/ui/GridPagination';
import coursesData from '@/mock/courses.json';
import type { Course } from '@/types';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export function CoursesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const courses = coursesData as Course[];

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    const matchLevel = !filters.level || filters.level === 'all' || c.level === filters.level;
    const matchStatus = !filters.status || filters.status === 'all' || c.status === filters.status;
    const matchCat = !filters.category || filters.category === 'all' || c.category === filters.category;
    return matchSearch && matchLevel && matchStatus && matchCat;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const categories = [...new Set(courses.map(c => c.category))];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-sm text-gray-500 mt-1">{courses.length} total courses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-gray-100' : ''}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView('list')} className={view === 'list' ? 'bg-gray-100' : ''}>
            <List className="w-4 h-4" />
          </Button>
          <PermissionGate module="Courses" action="create">
            <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-1" /> Add Course</Button>
          </PermissionGate>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search courses..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'category', placeholder: 'All Categories', options: categories.map(c => ({ value: c, label: c })) },
          { key: 'level', placeholder: 'All Levels', options: [{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }] },
          { key: 'status', placeholder: 'All Status', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }, { value: 'archived', label: 'Archived' }] },
        ]}
      />

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((course) => (
            <Card key={course.id} hover className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-navy-800 to-navy-600 rounded-t-lg -mt-6 -mx-6 mb-4 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gold-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'default'}>
                    {course.status}
                  </Badge>
                  <Badge variant="gold">{course.level}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrollmentCount}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold-500" /> {course.rating}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-navy-800">${course.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">{course.instructor}</span>
                </div>
                <button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="w-full flex items-center justify-center gap-1 mt-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 text-sm font-medium rounded-lg transition-colors"
                >
                  Enroll Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Course</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Instructor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Enrolled</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.duration} · {course.modules} modules</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{course.category}</td>
                  <td className="px-4 py-3 text-gray-600">{course.instructor}</td>
                  <td className="px-4 py-3 text-gray-600">{course.enrollmentCount}/{course.capacity}</td>
                  <td className="px-4 py-3">
                    <Badge variant={course.status === 'published' ? 'success' : 'warning'}>{course.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">${course.price}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="px-3 py-1.5 bg-gold-500 hover:bg-gold-400 text-navy-900 text-xs font-medium rounded-lg transition-colors"
                    >
                      Enroll Now →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <GridPagination totalItems={filtered.length} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />

      {/* Add Course Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Course" size="xl">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Course created!'); setShowAddModal(false); }}>
          <Input label="Course Title" placeholder="Enter course title" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-24" placeholder="Course description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Cybersecurity</option><option>Leadership</option><option>Technology</option><option>Compliance</option><option>Management</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price ($)" type="number" placeholder="0" />
            <Input label="Duration" placeholder="e.g., 40 hours" />
            <Input label="Capacity" type="number" placeholder="100" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Course</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
