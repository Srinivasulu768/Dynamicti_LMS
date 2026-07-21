import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Clock, Users, Eye, Edit, Trash2, UserCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FilterBar } from '@/components/ui/FilterBar';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { GridPagination } from '@/components/ui/GridPagination';
import sessionsData from '@/mock/sessions.json';
import type { Session } from '@/types';
import toast from 'react-hot-toast';

const statusColors: Record<string, 'success' | 'info' | 'warning' | 'default' | 'danger'> = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export function SessionsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [sessions, setSessions] = useState(sessionsData as Session[]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = sessions.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.courseName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || filters.status === 'all' || s.status === filters.status;
    const matchType = !filters.type || filters.type === 'all' || s.type === filters.type;
    return matchSearch && matchStatus && matchType;
  });

  const handleDelete = () => {
    if (selectedSession) {
      setSessions(sessions.filter(s => s.id !== selectedSession.id));
      setShowDeleteModal(false);
      setSelectedSession(null);
      toast.success('Session deleted!');
    }
  };

  const handleCancel = (session: Session) => {
    setSessions(sessions.map(s => s.id === session.id ? { ...s, status: 'cancelled' as const } : s));
    toast.success('Session cancelled');
  };

  // Mock attendees
  const mockAttendees = [
    { name: 'Michael Johnson', status: 'present' },
    { name: 'Emily Williams', status: 'present' },
    { name: 'Amanda Davis', status: 'absent' },
    { name: 'Christopher Wilson', status: 'present' },
    { name: 'Thomas Young', status: 'late' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} total sessions</p>
        <PermissionGate module="Sessions" action="create">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Schedule Session
          </Button>
        </PermissionGate>
      </div>

      <FilterBar
        searchPlaceholder="Search sessions..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'status', placeholder: 'All Status', options: [{ value: 'scheduled', label: 'Scheduled' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
          { key: 'type', placeholder: 'All Types', options: [{ value: 'virtual', label: 'Virtual' }, { value: 'in_person', label: 'In Person' }, { value: 'hybrid', label: 'Hybrid' }] },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice((page - 1) * 10, page * 10).map((session) => (
          <Card key={session.id} hover>
            <div className="flex items-center justify-between mb-3">
              <Badge variant={statusColors[session.status]}>{session.status.replace('_', ' ')}</Badge>
              <Badge variant={session.type === 'virtual' ? 'info' : session.type === 'hybrid' ? 'warning' : 'default'}>
                {session.type}
              </Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{session.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{session.courseName}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> {session.date}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> {session.startTime} - {session.endTime}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {session.location}</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> {session.attendees}/{session.capacity} attendees</div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 mb-3">
              Instructor: {session.instructorName}
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
              <button
                onClick={() => { setSelectedSession(session); setShowViewModal(true); }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-navy-800 bg-navy-800/5 hover:bg-navy-800/10 rounded-md transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> View
              </button>
              <button
                onClick={() => { setSelectedSession(session); setShowAttendanceModal(true); }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" /> Attendance
              </button>
              <button
                onClick={() => { setSelectedSession(session); setShowEditModal(true); }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              {session.status === 'scheduled' && (
                <button
                  onClick={() => handleCancel(session)}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
              <button
                onClick={() => { setSelectedSession(session); setShowDeleteModal(true); }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <GridPagination totalItems={filtered.length} pageSize={10} currentPage={page} onPageChange={setPage} />

      {/* Schedule Session Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Schedule Session" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Session scheduled!'); setShowAddModal(false); }}>
          <Input label="Session Title" placeholder="Enter session title" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Network Security Fundamentals</option>
              <option>Advanced Cybersecurity Operations</option>
              <option>Project Management Professional</option>
              <option>Leadership & Strategic Management</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Instructor</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>James Rodriguez</option>
                <option>Robert Taylor</option>
                <option>Daniel Lee</option>
                <option>Andrew Wright</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" required />
            <Input label="End Time" type="time" required />
          </div>
          <Input label="Location" placeholder="Room / Virtual link" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="in_person">In Person</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <Input label="Capacity" type="number" placeholder="50" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Schedule Session</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Session Details" size="md">
        {selectedSession && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={statusColors[selectedSession.status]}>{selectedSession.status.replace('_', ' ')}</Badge>
              <Badge variant={selectedSession.type === 'virtual' ? 'info' : 'default'}>{selectedSession.type}</Badge>
            </div>
            <h3 className="text-lg font-semibold">{selectedSession.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Course</span><span className="font-medium">{selectedSession.courseName}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Instructor</span><span className="font-medium">{selectedSession.instructorName}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Date</span><span className="font-medium">{selectedSession.date}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Time</span><span className="font-medium">{selectedSession.startTime} - {selectedSession.endTime}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Location</span><span className="font-medium">{selectedSession.location}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Attendees</span><span className="font-medium">{selectedSession.attendees}/{selectedSession.capacity}</span></div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Session" size="lg">
        {selectedSession && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowEditModal(false); toast.success('Session updated!'); }}>
            <Input label="Session Title" defaultValue={selectedSession.title} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" defaultValue={selectedSession.date} />
              <Input label="Location" defaultValue={selectedSession.location} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Time" type="time" defaultValue={selectedSession.startTime} />
              <Input label="End Time" type="time" defaultValue={selectedSession.endTime} />
            </div>
            <Input label="Capacity" type="number" defaultValue={String(selectedSession.capacity)} />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Attendance Modal */}
      <Modal isOpen={showAttendanceModal} onClose={() => setShowAttendanceModal(false)} title="Session Attendance" size="md">
        {selectedSession && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{selectedSession.title} · {selectedSession.date}</p>
            <div className="space-y-2">
              {mockAttendees.map((attendee, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{attendee.name}</span>
                  <select
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md"
                    defaultValue={attendee.status}
                    onChange={() => toast.success(`Attendance updated for ${attendee.name}`)}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAttendanceModal(false)}>Close</Button>
              <Button onClick={() => { setShowAttendanceModal(false); toast.success('Attendance saved!'); }}>Save Attendance</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Session" size="sm">
        {selectedSession && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{selectedSession.title}</strong>? This cannot be undone.</p>
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
