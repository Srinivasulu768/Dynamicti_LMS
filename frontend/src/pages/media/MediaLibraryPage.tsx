import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Upload, Clock, Eye, Edit, Trash2, Download, Search, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { mediaService } from '@/services/mediaService';
import { getCourses } from '@/services/courseService';
import { programService } from '@/services/programService';
import type { MediaItem, ParentType } from '@/types';
import toast from 'react-hot-toast';

export function MediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(mediaService.getAll);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const courses = getCourses();
  const programs = programService.getAll();
  const refresh = () => setMediaItems(mediaService.getAll());

  const filtered = mediaItems
    .filter(v => typeFilter === 'all' || v.mediaType === typeFilter)
    .filter(v =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const parentType = formData.get('parentType') as ParentType | '';
    const parentId = formData.get('parentId') as string;
    let parentName = '';
    if (parentId) {
      const parent = parentType === 'course'
        ? courses.find(c => c.id === parentId)
        : programs.find(p => p.id === parentId);
      parentName = parent?.title || '';
    }
    mediaService.create({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      mediaType: formData.get('mediaType') as MediaItem['mediaType'],
      url: '/media/uploaded-file',
      size: '0 MB',
      category: formData.get('category') as string,
      parentType: parentType ? parentType as ParentType : undefined,
      parentId: parentId || undefined,
      parentName: parentName || undefined,
      status: 'published',
      uploadDate: new Date().toISOString().split('T')[0],
      views: 0,
    } as Omit<MediaItem, 'id'>);
    refresh();
    setShowUploadModal(false);
    toast.success('Media uploaded successfully!');
  };

  const handleDelete = () => {
    if (selectedMedia) {
      mediaService.delete(selectedMedia.id);
      refresh();
      setShowDeleteModal(false);
      setSelectedMedia(null);
      toast.success('Media deleted!');
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-10 h-10 text-gray-400" />;
      case 'image': return <Image className="w-10 h-10 text-gray-400" />;
      default: return <FileText className="w-10 h-10 text-gray-400" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">{mediaItems.length} media items</p>
        </div>
        <PermissionGate module="Media Library" action="create">
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-1" /> Upload Media
          </Button>
        </PermissionGate>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="video">Videos</option>
          <option value="pdf">PDFs</option>
          <option value="document">Documents</option>
          <option value="image">Images</option>
          <option value="audio">Audio</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((media) => (
          <Card key={media.id} hover className="overflow-hidden">
            <div
              className="h-36 bg-gradient-to-br from-navy-900 to-navy-700 -mt-6 -mx-6 mb-4 flex items-center justify-center relative group cursor-pointer"
              onClick={() => { setSelectedMedia(media); setShowPlayerModal(true); }}
            >
              {getMediaIcon(media.mediaType)}
              {media.mediaType === 'video' && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </div>
              )}
              {media.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                  {media.duration}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <Badge variant="gold">{media.mediaType}</Badge>
              <Badge variant={media.status === 'published' ? 'success' : 'warning'}>{media.status}</Badge>
              {media.parentType && <Badge variant={media.parentType === 'course' ? 'info' : 'default'}>{media.parentType}</Badge>}
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{media.title}</h3>
            {media.parentName && <p className="text-xs text-gray-500 mb-2">{media.parentName}</p>}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              {media.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {media.duration}</span>}
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {media.views.toLocaleString()}</span>
              <span>{media.size}</span>
            </div>

            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
              <button
                onClick={() => { setSelectedMedia(media); setShowPlayerModal(true); }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-navy-800 bg-navy-800/5 hover:bg-navy-800/10 rounded-md transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <PermissionGate module="Media Library" action="edit">
                <button
                  onClick={() => { setSelectedMedia(media); setShowEditModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
              </PermissionGate>
              <button
                onClick={() => toast.success('Download started!')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <PermissionGate module="Media Library" action="delete">
                <button
                  onClick={() => { setSelectedMedia(media); setShowDeleteModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </PermissionGate>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No media found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Media" size="lg">
        <form className="space-y-4" onSubmit={handleUpload}>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-navy-800 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Drop files here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">MP4, MOV, PDF, DOCX, PNG, JPG (max 2GB)</p>
          </div>
          <Input label="Title *" name="title" placeholder="Enter media title" required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Media Type *</label>
              <select name="mediaType" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="document">Document</option>
                <option value="image">Image</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option>Cybersecurity</option>
                <option>Technology</option>
                <option>Leadership</option>
                <option>Medical</option>
                <option>Compliance</option>
                <option>Combatives</option>
                <option>Field/Range</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Attach To</label>
              <select name="parentType" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">None (standalone)</option>
                <option value="course">Course</option>
                <option value="program">Program</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select Parent</label>
              <select name="parentId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">None</option>
                <optgroup label="Courses">
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </optgroup>
                <optgroup label="Programs">
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </optgroup>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20" placeholder="Media description..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button type="submit">Upload</Button>
          </div>
        </form>
      </Modal>

      {/* View/Player Modal */}
      <Modal isOpen={showPlayerModal} onClose={() => setShowPlayerModal(false)} title="" size="xl">
        {selectedMedia && (
          <div className="space-y-4">
            {selectedMedia.mediaType === 'video' ? (
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={() => toast.success('Video playing...')}
                  >
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                  <p className="text-white/60 text-sm">Click to play</p>
                </div>
                {selectedMedia.duration && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between">
                      <span className="text-white text-xs">0:00 / {selectedMedia.duration}</span>
                      <div className="flex-1 mx-3 h-1 bg-white/20 rounded-full">
                        <div className="h-1 w-0 bg-gold-500 rounded-full" />
                      </div>
                      <span className="text-white text-xs">{selectedMedia.duration}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-12 text-center">
                {getMediaIcon(selectedMedia.mediaType)}
                <p className="text-sm text-gray-600 mt-3">Preview not available for {selectedMedia.mediaType} files</p>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedMedia.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                <span>{selectedMedia.category}</span>
                <span>{selectedMedia.views.toLocaleString()} views</span>
                <span>Uploaded: {selectedMedia.uploadDate}</span>
                <span>{selectedMedia.size}</span>
                {selectedMedia.parentName && <span>Attached to: {selectedMedia.parentName}</span>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Media" size="md">
        {selectedMedia && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            mediaService.update(selectedMedia.id, {
              title: formData.get('title') as string,
              category: formData.get('category') as string,
              status: formData.get('status') as 'draft' | 'published',
            });
            refresh();
            setShowEditModal(false);
            toast.success('Media updated!');
          }}>
            <Input label="Title *" name="title" defaultValue={selectedMedia.title} required />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedMedia.category}>
                  <option>Cybersecurity</option>
                  <option>Technology</option>
                  <option>Leadership</option>
                  <option>Medical</option>
                  <option>Compliance</option>
                  <option>Combatives</option>
                  <option>Field/Range</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedMedia.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Media" size="sm">
        {selectedMedia && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{selectedMedia.title}</strong>? This cannot be undone.</p>
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
