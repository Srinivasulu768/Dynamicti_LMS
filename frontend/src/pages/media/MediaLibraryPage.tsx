import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Upload, Clock, Eye, Edit, Trash2, X, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const initialVideos = [
  { id: 'VID001', title: 'Incident Response Procedures', category: 'Cybersecurity', duration: '25:30', views: 1245, status: 'published', uploadDate: '2026-06-15' },
  { id: 'VID002', title: 'Drone Pre-flight Checklist', category: 'Technology', duration: '15:45', views: 892, status: 'published', uploadDate: '2026-06-20' },
  { id: 'VID003', title: 'Leadership in Crisis', category: 'Leadership', duration: '42:10', views: 2100, status: 'published', uploadDate: '2026-05-28' },
  { id: 'VID004', title: 'Network Monitoring Tools', category: 'Cybersecurity', duration: '38:20', views: 1567, status: 'published', uploadDate: '2026-06-01' },
  { id: 'VID005', title: 'First Aid in the Field', category: 'Medical', duration: '55:00', views: 987, status: 'published', uploadDate: '2026-06-10' },
  { id: 'VID006', title: 'Data Visualization Basics', category: 'Analytics', duration: '20:15', views: 654, status: 'draft', uploadDate: '2026-07-18' },
];

export function MediaLibraryPage() {
  const [videos, setVideos] = useState(initialVideos);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<typeof initialVideos[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = videos.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (selectedVideo) {
      setVideos(videos.filter(v => v.id !== selectedVideo.id));
      setShowDeleteModal(false);
      setSelectedVideo(null);
      toast.success('Video deleted!');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">{videos.length} videos</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-1" /> Upload Video
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((video) => (
          <Card key={video.id} hover className="overflow-hidden">
            {/* Video Thumbnail */}
            <div
              className="h-36 bg-gradient-to-br from-navy-900 to-navy-700 -mt-6 -mx-6 mb-4 flex items-center justify-center relative group cursor-pointer"
              onClick={() => { setSelectedVideo(video); setShowPlayerModal(true); }}
            >
              <Video className="w-10 h-10 text-gray-400" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                {video.duration}
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <Badge variant="gold">{video.category}</Badge>
              <Badge variant={video.status === 'published' ? 'success' : 'warning'}>{video.status}</Badge>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">{video.title}</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {video.duration}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {video.views.toLocaleString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
              <button
                onClick={() => { setSelectedVideo(video); setShowPlayerModal(true); }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-navy-800 bg-navy-800/5 hover:bg-navy-800/10 rounded-md transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Play
              </button>
              <button
                onClick={() => { setSelectedVideo(video); setShowEditModal(true); }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => toast.success('Download started!')}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setSelectedVideo(video); setShowDeleteModal(true); }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No videos found</p>
          <p className="text-sm">Try adjusting your search</p>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Video" size="lg">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-navy-800 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Drop video files here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI, WebM (max 2GB)</p>
          </div>
          <Input label="Video Title" placeholder="Enter video title" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Cybersecurity</option>
                <option>Technology</option>
                <option>Leadership</option>
                <option>Medical</option>
                <option>Analytics</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20" placeholder="Video description..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button onClick={() => { setShowUploadModal(false); toast.success('Video uploaded successfully!'); }}>Upload</Button>
          </div>
        </div>
      </Modal>

      {/* Video Player Modal */}
      <Modal isOpen={showPlayerModal} onClose={() => setShowPlayerModal(false)} title="" size="xl">
        {selectedVideo && (
          <div className="space-y-4">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => toast.success('Video playing...')}
                >
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <p className="text-white/60 text-sm">Click to play</p>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-white text-xs">0:00 / {selectedVideo.duration}</span>
                  <div className="flex-1 mx-3 h-1 bg-white/20 rounded-full">
                    <div className="h-1 w-0 bg-gold-500 rounded-full" />
                  </div>
                  <span className="text-white text-xs">{selectedVideo.duration}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedVideo.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span>{selectedVideo.category}</span>
                <span>{selectedVideo.views.toLocaleString()} views</span>
                <span>Uploaded: {selectedVideo.uploadDate}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Video" size="md">
        {selectedVideo && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowEditModal(false); toast.success('Video updated!'); }}>
            <Input label="Title" defaultValue={selectedVideo.title} required />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedVideo.category}>
                  <option>Cybersecurity</option>
                  <option>Technology</option>
                  <option>Leadership</option>
                  <option>Medical</option>
                  <option>Analytics</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedVideo.status}>
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

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Video" size="sm">
        {selectedVideo && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{selectedVideo.title}</strong>? This cannot be undone.</p>
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
