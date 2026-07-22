import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, File, Plus, Upload, Layers, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { contentService } from '@/services/contentService';
import { getCourses } from '@/services/courseService';
import { programService } from '@/services/programService';
import type { ContentItem, ParentType } from '@/types';
import toast from 'react-hot-toast';

const typeIcons: Record<string, typeof FileText> = { module: Layers, lesson: FileText, document: File, video: Video, pdf: File, assignment: FileText };

export function ContentPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'modules' | 'lessons' | 'documents' | 'videos'>('all');
  const [contentItems, setContentItems] = useState<ContentItem[]>(contentService.getAll);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const courses = getCourses();
  const programs = programService.getAll();

  const refresh = () => setContentItems(contentService.getAll());

  const filtered = contentItems
    .filter(c => {
      if (activeTab === 'all') return true;
      if (activeTab === 'modules') return c.contentType === 'module';
      if (activeTab === 'lessons') return c.contentType === 'lesson';
      if (activeTab === 'documents') return c.contentType === 'document' || c.contentType === 'pdf';
      if (activeTab === 'videos') return c.contentType === 'video';
      return true;
    })
    .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.parentName.toLowerCase().includes(searchTerm.toLowerCase()));

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

    contentService.create({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      contentType: formData.get('contentType') as ContentItem['contentType'],
      parentType,
      parentId,
      parentName: parent.title,
      moduleId: (formData.get('moduleId') as string) || undefined,
      order: contentItems.filter(i => i.parentId === parentId).length + 1,
      duration: (formData.get('duration') as string) || undefined,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
    } as Omit<ContentItem, 'id'>);
    refresh();
    setShowCreateModal(false);
    toast.success('Content created successfully!');
  };

  const handleDelete = () => {
    if (selectedItem) {
      contentService.delete(selectedItem.id);
      refresh();
      setShowDeleteModal(false);
      setSelectedItem(null);
      toast.success('Content deleted successfully!');
    }
  };

  const handlePublish = (item: ContentItem) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    contentService.update(item.id, { status: newStatus, updatedDate: new Date().toISOString().split('T')[0] });
    refresh();
    toast.success(newStatus === 'published' ? 'Content published!' : 'Content unpublished');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage modules, lessons, and media for Courses and Programs</p>
        </div>
        <div className="flex gap-2">
          <PermissionGate module="Content" action="create">
            <Button variant="outline" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-1" /> Upload
            </Button>
          </PermissionGate>
          <PermissionGate module="Content" action="create">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Create Content
            </Button>
          </PermissionGate>
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
          const Icon = typeIcons[item.contentType] || FileText;
          return (
            <Card key={item.id} hover>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-navy-800/5 rounded-lg"><Icon className="w-5 h-5 text-navy-800" /></div>
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="gold">{item.contentType}</Badge>
                  <Badge variant={item.status === 'published' ? 'success' : 'warning'}>{item.status}</Badge>
                  <Badge variant={item.parentType === 'course' ? 'info' : 'default'}>{item.parentType}</Badge>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{item.parentName}</p>
              <p className="text-xs text-gray-400 mb-3">Updated: {item.updatedDate}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => { setSelectedItem(item); setShowViewModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-navy-800 bg-navy-800/5 hover:bg-navy-800/10 rounded-md transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <PermissionGate module="Content" action="edit">
                  <button
                    onClick={() => { setSelectedItem(item); setShowEditModal(true); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                </PermissionGate>
                <PermissionGate module="Content" action="edit">
                  <button
                    onClick={() => handlePublish(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                  >
                    {item.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                </PermissionGate>
                <PermissionGate module="Content" action="delete">
                  <button
                    onClick={() => { setSelectedItem(item); setShowDeleteModal(true); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </PermissionGate>
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
          <Input label="Title *" name="title" placeholder="Content title" required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Content Type *</label>
              <select name="contentType" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="module">Module</option>
                <option value="lesson">Lesson</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="pdf">PDF</option>
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
          <Input label="Duration" name="duration" placeholder="e.g., 45 min (optional)" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20" placeholder="Content description..." />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Belongs To</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="course">Course</option>
                <option value="program">Program</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Assign to</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <optgroup label="Courses">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </optgroup>
                <optgroup label="Programs">
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </optgroup>
              </select>
            </div>
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
              <Badge variant="gold">{selectedItem.contentType}</Badge>
              <Badge variant={selectedItem.status === 'published' ? 'success' : 'warning'}>{selectedItem.status}</Badge>
              <Badge variant={selectedItem.parentType === 'course' ? 'info' : 'default'}>{selectedItem.parentType}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{selectedItem.title}</h3>
            {selectedItem.description && <p className="text-sm text-gray-600">{selectedItem.description}</p>}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Parent</span>
                <span className="font-medium">{selectedItem.parentName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Parent Type</span>
                <span className="font-medium capitalize">{selectedItem.parentType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Content Type</span>
                <span className="font-medium capitalize">{selectedItem.contentType}</span>
              </div>
              {selectedItem.duration && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{selectedItem.duration}</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">{selectedItem.updatedDate}</span>
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
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            contentService.update(selectedItem.id, {
              title: formData.get('title') as string,
              description: (formData.get('description') as string) || undefined,
              status: formData.get('status') as 'draft' | 'published',
              duration: (formData.get('duration') as string) || undefined,
              updatedDate: new Date().toISOString().split('T')[0],
            });
            refresh();
            setShowEditModal(false);
            toast.success('Content updated!');
          }}>
            <Input label="Title *" name="title" defaultValue={selectedItem.title} required />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedItem.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <Input label="Duration" name="duration" defaultValue={selectedItem.duration || ''} placeholder="e.g., 45 min" />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20" defaultValue={selectedItem.description || ''} />
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
