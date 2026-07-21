import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Users, Clock, Star, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FilterBar } from '@/components/ui/FilterBar';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { GridPagination } from '@/components/ui/GridPagination';
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/services/courseService';
import { loadUsers } from '@/services/userService';
import type { Course, User } from '@/types';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export function CoursesPage() {
  const instructors = (loadUsers() as User[]).filter(u => u.role === 'instructor');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>(getCourses);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const refreshCourses = () => setCourses(getCourses());

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const selectedInstructorId = formData.get('instructor') as string;
    const instructorUser = instructors.find(i => i.id === selectedInstructorId);
    createCourse({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || '',
      category: formData.get('category') as string,
      level: formData.get('level') as Course['level'],
      price: Number(formData.get('price')),
      duration: formData.get('duration') as string,
      capacity: Number(formData.get('capacity')) || 100,
      instructor: instructorUser ? `${instructorUser.firstName} ${instructorUser.lastName}` : '',
      instructorId: selectedInstructorId || '',
      enrollmentCount: 0,
      rating: 0,
      modules: 0,
      lessons: 0,
      startDate: '',
      endDate: '',
      status: 'published',
      prerequisites: [],
      tags: [],
    });
    refreshCourses();
    setPage(1);
    setSearch('');
    setFilters({});
    toast.success('Course created successfully!');
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const selectedInstructorId = formData.get('instructor') as string;
    const instructorUser = instructors.find(i => i.id === selectedInstructorId);
    updateCourse(selectedCourse.id, {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || selectedCourse.description,
      category: formData.get('category') as string,
      level: formData.get('level') as Course['level'],
      price: Number(formData.get('price')),
      duration: formData.get('duration') as string,
      capacity: Number(formData.get('capacity')) || selectedCourse.capacity,
      instructor: instructorUser ? `${instructorUser.firstName} ${instructorUser.lastName}` : selectedCourse.instructor,
      instructorId: selectedInstructorId || selectedCourse.instructorId,
    });
    refreshCourses();
    toast.success('Course updated successfully!');
    setShowEditModal(false);
    setSelectedCourse(null);
  };

  const handleDelete = () => {
    if (!selectedCourse) return;
    deleteCourse(selectedCourse.id);
    refreshCourses();
    toast.success('Course deleted successfully!');
    setShowDeleteModal(false);
    setSelectedCourse(null);
  };

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    const matchLevel = !filters.level || filters.level === 'all' || c.level === filters.level;
    const matchCat = !filters.category || filters.category === 'all' || c.category === filters.category;
    return matchSearch && matchLevel && matchCat;
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
        ]}
      />

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((course) => (
          <Card key={course.id} hover className="overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-navy-800 to-navy-600 rounded-t-lg -mt-6 -mx-6 mb-4 flex items-center justify-center relative">
              <BookOpen className="w-10 h-10 text-gold-500" />
              <div className="absolute top-2 right-2 flex gap-1">
                <PermissionGate module="Courses" action="edit">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setShowEditModal(true); }}
                    className="p-1.5 bg-white/90 hover:bg-white rounded-md transition-colors"
                    title="Edit course"
                  >
                    <Pencil className="w-3.5 h-3.5 text-navy-800" />
                  </button>
                </PermissionGate>
                <PermissionGate module="Courses" action="delete">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setShowDeleteModal(true); }}
                    className="p-1.5 bg-white/90 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </PermissionGate>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <Badge variant="gold">{course.level}</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrollmentCount}/{course.capacity}</span>
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

      {/* Pagination */}
      <GridPagination totalItems={filtered.length} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />

      {/* Add Course Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Course" size="xl">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Input label="Course Title *" name="title" placeholder="Enter course title" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-24" placeholder="Course description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
              <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="">Select category</option>
                <option>Cybersecurity</option><option>Leadership</option><option>Technology</option><option>Compliance</option><option>Management</option><option>Firearms</option><option>Forensics</option><option>Corrections</option><option>Administrative</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Level <span className="text-red-500">*</span></label>
              <select name="level" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="">Select level</option>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Instructor</label>
            <select name="instructor" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select instructor</option>
              {instructors.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.firstName} {inst.lastName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price ($) *" name="price" type="number" placeholder="0" required />
            <Input label="Duration *" name="duration" placeholder="e.g., 40 hours" required />
            <Input label="Capacity" name="capacity" type="number" placeholder="100" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Course</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedCourse(null); }} title="Edit Course" size="xl">
        {selectedCourse && (
          <form className="space-y-4" onSubmit={handleEdit}>
            <Input label="Course Title *" name="title" placeholder="Enter course title" defaultValue={selectedCourse.title} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-24" placeholder="Course description..." defaultValue={selectedCourse.description} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedCourse.category} required>
                  <option value="">Select category</option>
                  <option>Cybersecurity</option><option>Leadership</option><option>Technology</option><option>Compliance</option><option>Management</option><option>Firearms</option><option>Forensics</option><option>Corrections</option><option>Administrative</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Level <span className="text-red-500">*</span></label>
                <select name="level" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedCourse.level} required>
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Instructor</label>
              <select name="instructor" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedCourse.instructorId}>
                <option value="">Select instructor</option>
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.firstName} {inst.lastName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Price ($) *" name="price" type="number" placeholder="0" defaultValue={selectedCourse.price} required />
              <Input label="Duration *" name="duration" placeholder="e.g., 40 hours" defaultValue={selectedCourse.duration} required />
              <Input label="Capacity" name="capacity" type="number" placeholder="100" defaultValue={selectedCourse.capacity} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => { setShowEditModal(false); setSelectedCourse(null); }}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedCourse(null); }} title="Delete Course" size="sm">
        {selectedCourse && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{selectedCourse.title}"</span>? This action cannot be undone.
            </p>
            {selectedCourse.enrollmentCount > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700">
                  ⚠️ This course has <strong>{selectedCourse.enrollmentCount}</strong> active enrollments. Deleting it will affect enrolled learners.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedCourse(null); }}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
