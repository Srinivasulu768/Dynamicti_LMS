import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Grid3X3, List, GraduationCap, Users, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FilterBar } from '@/components/ui/FilterBar';
import { GridPagination } from '@/components/ui/GridPagination';
import programsData from '@/mock/programs.json';
import { PermissionGate } from '@/components/ui/PermissionGate';
import toast from 'react-hot-toast';

export function ProgramsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const categories = [...new Set(programsData.map(p => p.category))];

  const filtered = programsData.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filters.category || filters.category === 'all' || p.category === filters.category;
    const matchStatus = !filters.status || filters.status === 'all' || p.status === filters.status;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} training programs</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setView('grid')} className={view === 'grid' ? 'bg-gray-100' : ''}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView('list')} className={view === 'list' ? 'bg-gray-100' : ''}>
            <List className="w-4 h-4" />
          </Button>
          <PermissionGate module="Programs" action="create">
            <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-1" /> Add Program</Button>
          </PermissionGate>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search programs..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'category', placeholder: 'All Categories', options: categories.map(c => ({ value: c, label: c })) },
          { key: 'status', placeholder: 'All Status', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }] },
        ]}
      />
      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice((page - 1) * 10, page * 10).map((program) => (
            <Card key={program.id} hover className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-navy-800 to-navy-600 rounded-t-lg -mt-6 -mx-6 mb-4 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-gold-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={program.status === 'published' ? 'success' : program.status === 'draft' ? 'warning' : 'default'}>
                    {program.status}
                  </Badge>
                  <Badge variant="gold">{program.level}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 line-clamp-2">{program.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{program.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {program.enrollmentCount}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {program.duration}</span>
                  <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {program.courses.length} courses</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-navy-800">${program.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">{program.category}</span>
                </div>
                <button
                  onClick={() => navigate(`/programs/${program.id}`)}
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
                <th className="px-4 py-3 text-left font-medium text-gray-600">Program</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Duration</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Enrolled</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{program.title}</p>
                    <p className="text-xs text-gray-500">{program.courses.length} courses · {program.level}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{program.category}</td>
                  <td className="px-4 py-3 text-gray-600">{program.duration}</td>
                  <td className="px-4 py-3 text-gray-600">{program.enrollmentCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={program.status === 'published' ? 'success' : 'warning'}>{program.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium">${program.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/programs/${program.id}`)}
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

      <GridPagination totalItems={filtered.length} pageSize={10} currentPage={page} onPageChange={setPage} />

      {/* Add Program Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Program" size="xl">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Program created!'); setShowAddModal(false); }}>
          <Input label="Program Title" placeholder="Enter program title" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-24" placeholder="Program description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
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
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>All Levels</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Price ($)" type="number" placeholder="0" />
            <Input label="Duration" placeholder="e.g., 5 Days" />
            <Input label="Max Enrollment" type="number" placeholder="100" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Program</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
