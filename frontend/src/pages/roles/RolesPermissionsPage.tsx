import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Edit, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface RoleData {
  id: string;
  name: string;
  description: string;
  users: number;
  type: string;
}

const initialRoles: RoleData[] = [
  { id: 'super_admin', name: 'Super Admin', description: 'Full platform access and control', users: 1, type: 'system' },
  { id: 'training_admin', name: 'Training Administrator', description: 'Manage training operations, sessions, enrollments', users: 2, type: 'system' },
  { id: 'content_manager', name: 'Content Manager', description: 'Manage courses, content, assessments', users: 2, type: 'system' },
  { id: 'instructor', name: 'Instructor', description: 'Conduct sessions, evaluate learners', users: 4, type: 'system' },
  { id: 'org_admin', name: 'Organization Administrator', description: 'Manage organization users and training', users: 3, type: 'system' },
  { id: 'learner', name: 'Learner', description: 'Access enrolled courses and content', users: 986, type: 'system' },
];

const modules = [
  'Dashboard', 'Users', 'Courses', 'Programs', 'Content', 'Assessments',
  'Enrollments', 'Sessions', 'Instructors', 'Organizations', 'Payments',
  'Certificates', 'Reports', 'Inquiries', 'Notifications', 'Media Library',
  'Settings', 'System Monitor',
];

type PermissionSet = { view: boolean; create: boolean; edit: boolean; delete: boolean };
type RolePermissions = Record<string, PermissionSet>;

const initialPermissions: Record<string, RolePermissions> = {
  super_admin: Object.fromEntries(modules.map(m => [m, { view: true, create: true, edit: true, delete: true }])),
  training_admin: {
    Dashboard: { view: true, create: false, edit: false, delete: false },
    Users: { view: true, create: true, edit: true, delete: false },
    Courses: { view: true, create: true, edit: true, delete: true },
    Programs: { view: true, create: true, edit: true, delete: true },
    Content: { view: true, create: false, edit: false, delete: false },
    Assessments: { view: true, create: true, edit: true, delete: false },
    Enrollments: { view: true, create: true, edit: true, delete: true },
    Sessions: { view: true, create: true, edit: true, delete: true },
    Instructors: { view: true, create: true, edit: true, delete: false },
    Organizations: { view: true, create: true, edit: true, delete: false },
    Payments: { view: true, create: false, edit: false, delete: false },
    Certificates: { view: true, create: true, edit: true, delete: false },
    Reports: { view: true, create: false, edit: false, delete: false },
    Inquiries: { view: true, create: true, edit: true, delete: false },
    Notifications: { view: true, create: true, edit: true, delete: true },
    'Media Library': { view: true, create: false, edit: false, delete: false },
    Settings: { view: true, create: false, edit: true, delete: false },
    'System Monitor': { view: false, create: false, edit: false, delete: false },
  },
  content_manager: Object.fromEntries(modules.map(m => [m, {
    view: ['Dashboard', 'Courses', 'Programs', 'Content', 'Assessments', 'Media Library'].includes(m),
    create: ['Courses', 'Programs', 'Content', 'Assessments', 'Media Library'].includes(m),
    edit: ['Courses', 'Programs', 'Content', 'Assessments', 'Media Library'].includes(m),
    delete: ['Content'].includes(m),
  }])),
  instructor: Object.fromEntries(modules.map(m => [m, {
    view: ['Dashboard', 'Courses', 'Assessments', 'Sessions'].includes(m),
    create: false,
    edit: ['Assessments'].includes(m),
    delete: false,
  }])),
  org_admin: Object.fromEntries(modules.map(m => [m, {
    view: ['Dashboard', 'Enrollments', 'Certificates', 'Reports'].includes(m),
    create: ['Enrollments'].includes(m),
    edit: false,
    delete: false,
  }])),
  learner: Object.fromEntries(modules.map(m => [m, { view: ['Dashboard'].includes(m), create: false, edit: false, delete: false }])),
};

export function RolesPermissionsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [rolesList, setRolesList] = useState(initialRoles);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [editPerms, setEditPerms] = useState<RolePermissions>({});
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleEditRole = (role: RoleData) => {
    setSelectedRole(role);
    setEditName(role.name);
    setEditDescription(role.description);
    const currentPerms = permissions[role.id] || Object.fromEntries(modules.map(m => [m, { view: false, create: false, edit: false, delete: false }]));
    setEditPerms(JSON.parse(JSON.stringify(currentPerms)));
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedRole) return;
    setRolesList(rolesList.map(r => r.id === selectedRole.id ? { ...r, name: editName, description: editDescription } : r));
    setPermissions({ ...permissions, [selectedRole.id]: editPerms });
    setShowEditModal(false);
    toast.success(`"${editName}" updated successfully!`);
  };

  const togglePermission = (module: string, action: keyof PermissionSet) => {
    setEditPerms({
      ...editPerms,
      [module]: { ...editPerms[module], [action]: !editPerms[module]?.[action] },
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage roles and module-level access control</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Create Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesList.map((role) => (
          <Card key={role.id} hover>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-navy-800/5 rounded-lg"><Shield className="w-5 h-5 text-navy-800" /></div>
              <Badge variant={role.type === 'system' ? 'gold' : 'default'}>{role.type}</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{role.description}</p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{role.users} users assigned</span>
              <button
                onClick={() => handleEditRole(role)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Edit className="w-3 h-3" /> Edit
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Role Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Role & Permissions" size="xl">
        {selectedRole && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Role Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" value={selectedRole.type} disabled />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-navy-800/20" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Module Permissions</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_60px_60px_60px_60px] bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <span>Module</span>
                  <span className="text-center">View</span>
                  <span className="text-center">Create</span>
                  <span className="text-center">Edit</span>
                  <span className="text-center">Delete</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {modules.map((mod) => {
                    const perms = editPerms[mod] || { view: false, create: false, edit: false, delete: false };
                    return (
                      <div key={mod} className="grid grid-cols-[1fr_60px_60px_60px_60px] px-4 py-2.5 hover:bg-gray-50 items-center">
                        <span className="text-sm text-gray-900">{mod}</span>
                        {(['view', 'create', 'edit', 'delete'] as (keyof PermissionSet)[]).map((action) => (
                          <span key={action} className="flex justify-center">
                            <input type="checkbox" checked={perms[action]} onChange={() => togglePermission(mod, action)} className="w-4 h-4 accent-navy-800 rounded cursor-pointer" />
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit}><Save className="w-4 h-4 mr-1" /> Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Role Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create Custom Role" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Custom role created!'); setShowAddModal(false); }}>
          <Input label="Role Name" placeholder="e.g., Regional Manager" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-16" placeholder="Describe this role's responsibilities..." />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Module Permissions</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_60px_60px_60px_60px] bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <span>Module</span>
                <span className="text-center">View</span>
                <span className="text-center">Create</span>
                <span className="text-center">Edit</span>
                <span className="text-center">Delete</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {modules.map((mod) => (
                  <div key={mod} className="grid grid-cols-[1fr_60px_60px_60px_60px] px-4 py-2.5 hover:bg-gray-50 items-center">
                    <span className="text-sm text-gray-700">{mod}</span>
                    {['view', 'create', 'edit', 'delete'].map((a) => (
                      <span key={a} className="flex justify-center"><input type="checkbox" className="w-4 h-4 accent-navy-800 rounded cursor-pointer" /></span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Role</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
