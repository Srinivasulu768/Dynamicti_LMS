import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, GraduationCap, Users, Clock, BookOpen, ChevronRight, Pencil, Trash2, Send, Archive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FilterBar } from '@/components/ui/FilterBar';
import { GridPagination } from '@/components/ui/GridPagination';
import { programService } from '@/services/programService';
import { loadUsers } from '@/services/userService';
import { PermissionGate } from '@/components/ui/PermissionGate';
import type { Program, User } from '@/types';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export function ProgramsPage() {
  const allUsers = loadUsers() as User[];
  const contentManagers = allUsers.filter(u => u.role === 'content_manager');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [programs, setPrograms] = useState<Program[]>(programService.getAll);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const refreshPrograms = () => setPrograms(programService.getAll());

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const assignedTo = formData.get('assignedTo') as string;
    programService.create({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || '',
      category: formData.get('category') as string,
      duration: formData.get('duration') as string,
      level: formData.get('level') as string,
      price: Number(formData.get('price')) || 0,
      status: 'draft',
      enrollmentCount: 0,
      startDate: '',
      endDate: '',
      tags: [],
      modules: [],
      sessions: [],
      assessments: [],
      media: [],
      assignedTo: assignedTo || undefined,
    } as Omit<Program, 'id'>);
    refreshPrograms();
    setPage(1);
    toast.success('Program created as draft!');
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProgram) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const assignedTo = formData.get('assignedTo') as string;
    programService.update(selectedProgram.id, {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || selectedProgram.description,
      category: formData.get('category') as string,
      duration: formData.get('duration') as string,
      level: formData.get('level') as string,
      price: Number(formData.get('price')) || selectedProgram.price,
      assignedTo: assignedTo || selectedProgram.assignedTo,
    });
    refreshPrograms();
    toast.success('Program updated successfully!');
    setShowEditModal(false);
    setSelectedProgram(null);
  };

  const handleDelete = () => {
    if (!selectedProgram) return;
    programService.delete(selectedProgram.id);
    refreshPrograms();
    toast.success('Program deleted successfully!');
    setShowDeleteModal(false);
    setSelectedProgram(null);
  };

  const handlePublish = (program: Program) => {
    programService.update(program.id, { status: 'published', publishedDate: new Date().toISOString().split('T')[0] });
    refreshPrograms();
    toast.success(`"${program.title}" published successfully!`);
  };

  const handleArchive = (program: Program) => {
    programService.update(program.id, { status: 'archived' });
    refreshPrograms();
    toast.success(`"${program.title}" archived.`);
  };

  const handleRestore = (program: Program) => {
    programService.update(program.id, { status: 'draft' });
    refreshPrograms();
    toast.success(`"${program.title}" restored to draft.`);
  };

  const categories = [...new Set(programs.map(p => p.category))];

  const filtered = programs.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filters.category || filters.category === 'all' || p.category === filters.category;
    const matchStatus = !filters.status || filters.status === 'all' || p.status === filters.status;
    return matchSearch && matchCat && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Management</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} training programs</p>
        </div>
        <PermissionGate module="Programs" action="create">
          <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-1" /> Add Program</Button>
        </PermissionGate>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search programs..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'category', placeholder: 'All Categories', options: categories.map(c => ({ value: c, label: c })) },
          { key: 'status', placeholder: 'All Status', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }] },
        ]}
      />

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((program) => (
          <Card key={program.id} hover className="overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-navy-800 to-navy-600 rounded-t-lg -mt-6 -mx-6 mb-4 flex items-center justify-center relative">
              <GraduationCap className="w-10 h-10 text-gold-500" />
              <div className="absolute top-2 right-2 flex gap-1">
                <PermissionGate module="Programs" action="edit">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedProgram(program); setShowEditModal(true); }}
                    className="p-1.5 bg-white/90 hover:bg-white rounded-md transition-colors"
                    title="Edit program"
                  >
                    <Pencil className="w-3.5 h-3.5 text-navy-800" />
                  </button>
                </PermissionGate>
                {program.status === 'draft' && (
                  <PermissionGate module="Programs" action="edit">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePublish(program); }}
                      className="p-1.5 bg-green-500/90 hover:bg-green-500 rounded-md transition-colors"
                      title="Publish program"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                  </PermissionGate>
                )}
                {program.status === 'published' && (
                  <PermissionGate module="Programs" action="edit">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleArchive(program); }}
                      className="p-1.5 bg-gray-500/90 hover:bg-gray-500 rounded-md transition-colors"
                      title="Archive program"
                    >
                      <Archive className="w-3.5 h-3.5 text-white" />
                    </button>
                  </PermissionGate>
                )}
                {program.status === 'archived' && (
                  <PermissionGate module="Programs" action="edit">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRestore(program); }}
                      className="p-1.5 bg-blue-500/90 hover:bg-blue-500 rounded-md transition-colors"
                      title="Restore to draft"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-white" />
                    </button>
                  </PermissionGate>
                )}
                <PermissionGate module="Programs" action="delete">
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedProgram(program); setShowDeleteModal(true); }}
                    className="p-1.5 bg-white/90 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete program"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </PermissionGate>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusBadge(program.status) as any}>{program.status}</Badge>
                <Badge variant="gold">{program.level}</Badge>
              </div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">{program.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{program.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {program.enrollmentCount}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {program.duration}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {program.modules?.length || 0} modules</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-navy-800">${program.price.toLocaleString()}</span>
                <span className="text-xs text-gray-500">{program.category}</span>
              </div>
              {program.status === 'published' ? (
                <button
                  onClick={() => navigate(`/programs/${program.id}`)}
                  className="w-full flex items-center justify-center gap-1 mt-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-navy-900 text-sm font-medium rounded-lg transition-colors"
                >
                  Enroll Now <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/programs/${program.id}`)}
                  className="w-full flex items-center justify-center gap-1 mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <GridPagination totalItems={filtered.length} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />

      {/* Add Program Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Program" size="xl">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Input label="Program Title *" name="title" placeholder="Enter program title" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-24" placeholder="Program description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
              <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="">Select category</option>
                <option>Combatives/Self Defense</option>
                <option>Field/Range</option>
                <option>Vehicle Operations</option>
                <option>Communications</option>
                <option>Physical Training</option>
                <option>Law Enforcement</option>
                <option>Executive Protection</option>
                <option>Intelligence</option>
                <option>Leadership</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Level <span className="text-red-500">*</span></label>
              <select name="level" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="">Select level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>All Levels</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Assign Content Manager</label>
            <select name="assignedTo" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Select content manager</option>
              {contentManagers.map(cm => (
                <option key={cm.id} value={cm.id}>{cm.firstName} {cm.lastName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($) *" name="price" type="number" placeholder="0" required />
            <Input label="Duration *" name="duration" placeholder="e.g., 5 Days" required />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">Program will be created as <strong>Draft</strong>. Assign a Content Manager to build modules, lessons, and assessments. Publish when ready.</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Program</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Program Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedProgram(null); }} title="Edit Program" size="xl">
        {selectedProgram && (
          <form className="space-y-4" onSubmit={handleEdit}>
            <Input label="Program Title *" name="title" placeholder="Enter program title" defaultValue={selectedProgram.title} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-24" defaultValue={selectedProgram.description} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedProgram.category} required>
                  <option value="">Select category</option>
                  <option>Combatives/Self Defense</option>
                  <option>Field/Range</option>
                  <option>Vehicle Operations</option>
                  <option>Communications</option>
                  <option>Physical Training</option>
                  <option>Law Enforcement</option>
                  <option>Executive Protection</option>
                  <option>Intelligence</option>
                  <option>Leadership</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Level <span className="text-red-500">*</span></label>
                <select name="level" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedProgram.level || ''} required>
                  <option value="">Select level</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>All Levels</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Assign Content Manager</label>
              <select name="assignedTo" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedProgram.assignedTo || ''}>
                <option value="">Select content manager</option>
                {contentManagers.map(cm => (
                  <option key={cm.id} value={cm.id}>{cm.firstName} {cm.lastName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price ($) *" name="price" type="number" placeholder="0" defaultValue={selectedProgram.price} required />
              <Input label="Duration *" name="duration" placeholder="e.g., 5 Days" defaultValue={selectedProgram.duration} required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => { setShowEditModal(false); setSelectedProgram(null); }}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedProgram(null); }} title="Delete Program" size="sm">
        {selectedProgram && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{selectedProgram.title}"</span>? This action cannot be undone.
            </p>
            {selectedProgram.enrollmentCount > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700">
                  ⚠️ This program has <strong>{selectedProgram.enrollmentCount}</strong> active enrollments.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setSelectedProgram(null); }}>Cancel</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
