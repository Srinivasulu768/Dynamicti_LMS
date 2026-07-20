import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, File, Plus, Upload, Layers, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const initialContent = [
  { id: 'MOD001', title: 'Network Security Basics', type: 'module', course: 'Network Security Fundamentals', lessons: 4, status: 'published', updatedAt: '2026-07-18' },
  { id: 'MOD002', title: 'Threat Detection & Analysis', type: 'module', course: 'Advanced Cybersecurity Operations', lessons: 6, status: 'published', updatedAt: '2026-07-17' },
  { id: 'MOD003', title: 'Leadership Principles', type: 'module', course: 'Leadership & Strategic Management', lessons: 4, status: 'published', updatedAt: '2026-07-15' },
  { id: 'LES001', title: 'Introduction to Firewalls', type: 'lesson', course: 'Network Security Fundamentals', duration: '45 min', status: 'published', updatedAt: '2026-07-19' },
  { id: 'LES002', title: 'VPN Configuration', type: 'lesson', course: 'Network Security Fundamentals', duration: '60 min', status: 'draft', updatedAt: '2026-07-20' },
  { id: 'DOC001', title: 'Cybersecurity Best Practices Guide', type: 'document', course: 'Advanced Cybersecurity Operations', format: 'PDF', status: 'published', updatedAt: '2026-07-16' },
  { id: 'VID001', title: 'Incident Response Demo', type: 'video', course: 'Advanced Cybersecurity Operations', duration: '25 min', status: 'published', updatedAt: '2026-07-14' },
  { id: 'VID002', title: 'Drone Pre-flight Checklist', type: 'video', course: 'Drone Operations & UAV Technology', duration: '15 min', status: 'draft', updatedAt: '2026-07-20' },
];

const typeIcons: Record<string, typeof FileText> = { module: Layers, lesson: FileText, document: File, video: Video };

export function ContentPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'modules' | 'lessons' | 'documents' | 'videos'>('all');
  const [contentItems, setContentItems] = useState(initialContent);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof initialContent[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = contentItems
    .filter(c => activeTab === 'all' || c.type === activeTab.slice(0, -1))
    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.course.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: `NEW${Date.now()}`,
      title: 'New Content Item',
      type: 'lesson',
      course: 'Assigned Course',
      status: 'draft',
      updatedAt: new Date().toISOString().split('T')[0],
      duration: '30 min',
    };
    setContentItems([newItem, ...contentItems] as typeof initialContent);
    setShowCreateModal(false);
    toast.success('Content created successfully!');
  };

  const handleDelete = () => {
    if (selectedItem) {
      setContentItems(contentItems.filter(c => c.id !== selectedItem.id));
      setShowDeleteModal(false);
      setSelectedItem(null);
      toast.success('Content deleted successfully!');
    }
  };

  const handlePublish = (item: typeof initialContent[0]) => {
    setContentItems(contentItems.map(c => c.id === item.id ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c));
    toast.success(item.status === 'published' ? 'Content unpublished' : 'Content published!');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage modules, lessons, and media</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-1" /> Upload
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Create Content
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['all', 'modules', 'lessons', 'documents', 'videos'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white shadow-sm text-navy-800' : 'text-gray-600 hover:text-gray-800'}`}
          >{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const Icon = typeIcons[item.type] || FileText;
          return (
            <Card key={item.id} hover>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-navy-800/5 rounded-lg"><Icon className="w-5 h-5 text-navy-800" /></div>
                <div className="flex gap-1">
                  <Badge variant="gold">{item.type}</Badge>
                  <Badge variant={item.status === 'published' ? 'success' : 'warning'}>{item.status}</Badge>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{item.course}</p>
              <p className="text-xs text-gray-400 mb-3">Updated: {item.updatedAt}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setSelectedItem(item); setShowViewModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-navy-800 bg-navy-800/5 hover:bg-navy-800/10 rounded-md transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button
                  onClick={() => { setSelectedItem(item); setShowEditModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handlePublish(item)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                >
                  {item.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => { setSelectedItem(item); setShowDeleteModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No content found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Content" size="lg">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Input label="Title" placeholder="Content title" required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="module">Module</option>
                <option value="lesson">Lesson</option>
                <option value="document">Document</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Network Security Fundamentals</option>
                <option>Advanced Cybersecurity Operations</option>
                <option>Leadership & Strategic Management</option>
                <option>Drone Operations & UAV Technology</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20" placeholder="Content description..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Content" size="md">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-navy-800 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, MP4, PNG, JPG (max 500MB)</p>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Assign to Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Network Security Fundamentals</option>
              <option>Advanced Cybersecurity Operations</option>
              <option>Leadership & Strategic Management</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button onClick={() => { setShowUploadModal(false); toast.success('File uploaded successfully!'); }}>Upload</Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Content Details" size="md">
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="gold">{selectedItem.type}</Badge>
              <Badge variant={selectedItem.status === 'published' ? 'success' : 'warning'}>{selectedItem.status}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{selectedItem.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Course</span>
                <span className="font-medium">{selectedItem.course}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Type</span>
                <span className="font-medium capitalize">{selectedItem.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Status</span>
                <span className="font-medium capitalize">{selectedItem.status}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">{selectedItem.updatedAt}</span>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Content" size="lg">
        {selectedItem && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowEditModal(false); toast.success('Content updated!'); }}>
            <Input label="Title" defaultValue={selectedItem.title} required />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedItem.type}>
                  <option value="module">Module</option>
                  <option value="lesson">Lesson</option>
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedItem.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20" placeholder="Description..." />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Content" size="sm">
        {selectedItem && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{selectedItem.title}</strong>? This action cannot be undone.
            </p>
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
