import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Calendar, BookOpen, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import toast from 'react-hot-toast';

const instructors = [
  { id: 'USR004', name: 'James Rodriguez', email: 'james.rodriguez@test.com', specialization: 'Cybersecurity', courses: 4, sessions: 12, rating: 4.8, availability: 'available', certifications: 'CISSP, CEH, CompTIA Security+', experience: '12 years' },
  { id: 'USR008', name: 'Robert Taylor', email: 'robert.t@test.com', specialization: 'Leadership & Analytics', courses: 3, sessions: 9, rating: 4.6, availability: 'available', certifications: 'PMP, MBA, Six Sigma Black Belt', experience: '15 years' },
  { id: 'USR014', name: 'Daniel Lee', email: 'daniel.l@test.com', specialization: 'Communications & Emergency', courses: 3, sessions: 8, rating: 4.7, availability: 'on_leave', certifications: 'EMT-P, NIMS, HAZMAT', experience: '10 years' },
  { id: 'USR020', name: 'Andrew Wright', email: 'andrew.w@test.com', specialization: 'Technology & Operations', courses: 3, sessions: 7, rating: 4.5, availability: 'available', certifications: 'FAA Part 107, AWS Solutions Architect', experience: '8 years' },
];

const schedule = [
  { instructor: 'James Rodriguez', session: 'Cybersecurity Lab', date: '2026-07-22', time: '09:00-12:00' },
  { instructor: 'Robert Taylor', session: 'Leadership Seminar', date: '2026-07-25', time: '14:00-17:00' },
  { instructor: 'Andrew Wright', session: 'PMP Prep', date: '2026-07-28', time: '10:00-16:00' },
];

export function InstructorsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<typeof instructors[0] | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'Instructor',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-navy-800 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">{row.name.split(' ').map((n: string) => n[0]).join('')}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialization', label: 'Specialization' },
    { key: 'courses', label: 'Courses', render: (row: any) => <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-gray-400" /> {row.courses}</span> },
    { key: 'sessions', label: 'Sessions', render: (row: any) => <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {row.sessions}</span> },
    { key: 'rating', label: 'Rating', render: (row: any) => <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold-500" /> {row.rating}</span> },
    { key: 'availability', label: 'Availability', render: (row: any) => <Badge variant={row.availability === 'available' ? 'success' : 'warning'}>{row.availability.replace('_', ' ')}</Badge> },
    { key: 'actions', label: '', sortable: false, render: (row: any) => (
      <button onClick={() => { setSelectedInstructor(row); setShowDetailModal(true); }} className="px-3 py-1 text-xs font-medium text-navy-800 bg-navy-800/5 hover:bg-navy-800/10 rounded-md">
        View Profile
      </button>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Management</h1>
          <p className="text-sm text-gray-500 mt-1">{instructors.length} instructors</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Instructor
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-navy-800" /><div><p className="text-sm text-gray-500">Total Assigned Courses</p><p className="text-xl font-bold">13</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-navy-800" /><div><p className="text-sm text-gray-500">Total Sessions</p><p className="text-xl font-bold">36</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Star className="w-5 h-5 text-gold-500" /><div><p className="text-sm text-gray-500">Avg Rating</p><p className="text-xl font-bold">4.65</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><Clock className="w-5 h-5 text-green-600" /><div><p className="text-sm text-gray-500">Available Now</p><p className="text-xl font-bold">3</p></div></div></Card>
      </div>

      <DataTable data={instructors as any} columns={columns} pageSize={10} />

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader><CardTitle>Instructor Schedule (Upcoming)</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2 font-medium">Instructor</th><th className="pb-2 font-medium">Session</th><th className="pb-2 font-medium">Date</th><th className="pb-2 font-medium">Time</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {schedule.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50"><td className="py-3 font-medium">{s.instructor}</td><td className="py-3">{s.session}</td><td className="py-3">{s.date}</td><td className="py-3">{s.time}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Instructor" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Instructor added!'); setShowAddModal(false); }}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" placeholder="First name" required />
            <Input label="Last Name" placeholder="Last name" required />
          </div>
          <Input label="Email" type="email" placeholder="instructor@test.com" required />
          <Input label="Specialization" placeholder="e.g., Cybersecurity" />
          <Input label="Certifications" placeholder="CISSP, CEH, etc." />
          <Input label="Years of Experience" type="number" placeholder="5" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Add Instructor</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Instructor Profile" size="lg">
        {selectedInstructor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">{selectedInstructor.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedInstructor.name}</h3>
                <p className="text-sm text-gray-500">{selectedInstructor.email}</p>
                <Badge variant={selectedInstructor.availability === 'available' ? 'success' : 'warning'} className="mt-1">{selectedInstructor.availability.replace('_', ' ')}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Specialization</p><p className="font-medium">{selectedInstructor.specialization}</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Experience</p><p className="font-medium">{selectedInstructor.experience}</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Courses Assigned</p><p className="font-medium">{selectedInstructor.courses}</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Sessions Conducted</p><p className="font-medium">{selectedInstructor.sessions}</p></div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-sm"><p className="text-gray-500">Certifications</p><p className="font-medium">{selectedInstructor.certifications}</p></div>
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="text-gray-500 mb-2">Performance Rating</p>
              <div className="flex items-center gap-2">
                <ProgressBar value={selectedInstructor.rating * 20} color="gold" className="flex-1" />
                <span className="font-bold text-gold-500">{selectedInstructor.rating}/5</span>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
