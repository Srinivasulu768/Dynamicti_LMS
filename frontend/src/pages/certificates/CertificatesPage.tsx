import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Eye, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { FilterBar } from '@/components/ui/FilterBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { certificateService } from '@/services/certificateService';
import { certificateTemplateService } from '@/services/certificateTemplateService';
import { getCourses } from '@/services/courseService';
import { programService } from '@/services/programService';
import { loadUsers } from '@/services/userService';
import type { Certificate, ParentType, User } from '@/types';
import toast from 'react-hot-toast';

export function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>(certificateService.getAll);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const courses = getCourses();
  const programs = programService.getAll();
  const learners = (loadUsers() as User[]).filter(u => u.role === 'learner');
  const templates = certificateTemplateService.getAll();
  const refresh = () => setCerts(certificateService.getAll());

  const filtered = useMemo(() => certs.filter(c => {
    const matchSearch = !search || c.userName.toLowerCase().includes(search.toLowerCase()) || c.courseName.toLowerCase().includes(search.toLowerCase()) || c.certificateNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || filters.status === 'all' || c.status === filters.status;
    const matchParent = !filters.parentType || filters.parentType === 'all' || c.parentType === filters.parentType;
    return matchSearch && matchStatus && matchParent;
  }), [certs, search, filters]);

  const active = certs.filter(c => c.status === 'active').length;
  const revoked = certs.filter(c => c.status === 'revoked').length;
  const courseCount = certs.filter(c => c.parentType === 'course').length;
  const programCount = certs.filter(c => c.parentType === 'program').length;

  const handleIssue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userId = formData.get('userId') as string;
    const parentType = formData.get('parentType') as ParentType;
    const parentId = formData.get('parentId') as string;
    const user = learners.find(u => u.id === userId);
    const parent = parentType === 'course'
      ? courses.find(c => c.id === parentId)
      : programs.find(p => p.id === parentId);

    if (!user || !parent) {
      toast.error('Please select a valid user and parent');
      return;
    }

    if (certificateService.hasActiveCertificate(userId, parentId)) {
      toast.error('User already has an active certificate for this item');
      return;
    }

    const template = certificateTemplateService.getByParent(parentType, parentId);
    certificateService.generate(
      userId,
      `${user.firstName} ${user.lastName}`,
      parentType,
      parentId,
      parent.title,
      template?.id || 'TPL001',
      template?.validityMonths || 12
    );
    refresh();
    setShowIssueModal(false);
    toast.success('Certificate issued successfully!');
  };

  const handleCreateTemplate = (e: React.FormEvent<HTMLFormElement>) => {
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

    certificateTemplateService.create({
      title: formData.get('title') as string,
      parentType,
      parentId,
      parentName: parent.title,
      validityMonths: Number(formData.get('validityMonths')) || 12,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
    } as any);
    setShowTemplateModal(false);
    toast.success('Certificate template created!');
  };

  const columns = [
    { key: 'certificateNumber', label: 'Certificate #', render: (c: Certificate) => <span className="font-mono text-xs">{c.certificateNumber}</span> },
    { key: 'userName', label: 'Recipient', render: (c: Certificate) => <span className="font-medium">{c.userName}</span> },
    { key: 'courseName', label: 'Parent', render: (c: Certificate) => (
      <div>
        <span className="text-sm">{c.courseName}</span>
        <Badge variant={c.parentType === 'course' ? 'info' : 'default'} className="ml-2 text-[10px]">{c.parentType}</Badge>
      </div>
    )},
    { key: 'issueDate', label: 'Issued' },
    { key: 'expiryDate', label: 'Expires', render: (c: Certificate) => c.expiryDate || 'N/A' },
    { key: 'status', label: 'Status', render: (c: Certificate) => (
      <Badge variant={c.status === 'active' ? 'success' : c.status === 'revoked' ? 'danger' : 'warning'}>{c.status}</Badge>
    )},
    { key: 'actions', label: 'Actions', sortable: false, render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => toast.success('Preview opened')}><Eye className="w-4 h-4 text-gray-500" /></button>
        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => toast.success('Downloaded!')}><Download className="w-4 h-4 text-gray-500" /></button>
        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => toast.success('Reissued!')}><RotateCcw className="w-4 h-4 text-gray-500" /></button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} certificates</p>
        <div className="flex gap-2">
          <PermissionGate module="Certificates" action="create">
            <Button variant="outline" onClick={() => setShowTemplateModal(true)}>Configure Template</Button>
          </PermissionGate>
          <PermissionGate module="Certificates" action="create">
            <Button onClick={() => setShowIssueModal(true)}><Plus className="w-4 h-4 mr-1" /> Issue Certificate</Button>
          </PermissionGate>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Issued" value={certs.length} icon={Award} />
        <StatsCard title="Active" value={active} icon={Award} />
        <StatsCard title="Course Certs" value={courseCount} icon={Award} />
        <StatsCard title="Program Certs" value={programCount} icon={Award} />
      </div>

      <FilterBar
        searchPlaceholder="Search by name, course, certificate #..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'status', placeholder: 'All Status', options: [{ value: 'active', label: 'Active' }, { value: 'revoked', label: 'Revoked' }, { value: 'expired', label: 'Expired' }] },
          { key: 'parentType', placeholder: 'All Types', options: [{ value: 'course', label: 'Course' }, { value: 'program', label: 'Program' }] },
        ]}
      />

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} pageSize={10} searchable={false} />

      {/* Issue Certificate Modal */}
      <Modal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)} title="Issue Certificate" size="lg">
        <form className="space-y-4" onSubmit={handleIssue}>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Learner *</label>
            <select name="userId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
              <option value="">Select learner</option>
              {learners.map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Certificate For *</label>
              <select name="parentType" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="course">Course</option>
                <option value="program">Program</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select *</label>
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
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowIssueModal(false)}>Cancel</Button>
            <Button type="submit">Issue Certificate</Button>
          </div>
        </form>
      </Modal>

      {/* Template Modal */}
      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Configure Certificate Template" size="lg">
        <form className="space-y-4" onSubmit={handleCreateTemplate}>
          <Input label="Template Title *" name="title" placeholder="e.g., Course Completion Certificate" required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">For *</label>
              <select name="parentType" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required>
                <option value="course">Course</option>
                <option value="program">Program</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select *</label>
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
          </div>
          <Input label="Validity (months)" name="validityMonths" type="number" placeholder="12" defaultValue={12} />
          <p className="text-xs text-gray-500">Set to 0 for no expiry.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
            <Button type="submit">Save Template</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
