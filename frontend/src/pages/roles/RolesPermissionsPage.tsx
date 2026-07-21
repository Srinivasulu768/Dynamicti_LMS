import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Edit, Save, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { usePermissions } from '@/contexts/PermissionsContext';
import seedRoles from '@/mock/roles.json';
import toast from 'react-hot-toast';

interface RoleData {
  id: string;
  name: string;
  description: string;
  users: number;
  type: string;
}

// ─── Persistence ─────────────────────────────────────────────────────────────
const ROLES_KEY = 'dynamicti_roles_v2';

function loadRoles(): RoleData[] {
  try {
    const stored = localStorage.getItem(ROLES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // Seed from JSON
  const seed = seedRoles as RoleData[];
  localStorage.setItem(ROLES_KEY, JSON.stringify(seed));
  return seed;
}

function persistRoles(roles: RoleData[]) {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

// ─── Modules ─────────────────────────────────────────────────────────────────
const modules = [
  'Dashboard', 'Users', 'Courses', 'Programs', 'Content', 'Assessments',
  'Enrollments', 'Sessions', 'Instructors', 'Organizations', 'Payments',
  'Certificates', 'Reports', 'Inquiries', 'Notifications', 'Media Library',
  'My Learning', 'My Schedule', 'My Courses', 'My Certificates', 'My Assessments',
  'Settings', 'System Monitor', 'Roles',
];

type PermissionSet = { read: boolean; create: boolean; edit: boolean; delete: boolean };
type RolePermissions = Record<string, PermissionSet>;

const EMPTY_PERMS: RolePermissions = Object.fromEntries(modules.map(m => [m, { read: false, create: false, edit: false, delete: false }]));

// ─── Component ───────────────────────────────────────────────────────────────
export function RolesPermissionsPage() {
  const [rolesList, setRolesList] = useState<RoleData[]>(() => {
    const stored = loadRoles();
    return stored;
  });
  const { permissions, updateRolePermissions, deleteRolePermissions } = usePermissions();

  // Sync: if permissions has roles not in rolesList, add them as custom roles
  const displayRoles = (() => {
    const existingIds = new Set(rolesList.map(r => r.id));
    const orphanedRoles: RoleData[] = Object.keys(permissions)
      .filter(id => !existingIds.has(id))
      .map(id => ({
        id,
        name: id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: 'Custom role',
        users: 0,
        type: 'custom',
      }));
    if (orphanedRoles.length > 0) {
      const merged = [...rolesList, ...orphanedRoles];
      persistRoles(merged);
      return merged;
    }
    return rolesList;
  })();

  // ─── Edit state ──────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [editPerms, setEditPerms] = useState<RolePermissions>(EMPTY_PERMS);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // ─── Create state ────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<RolePermissions>({ ...EMPTY_PERMS });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  // ─── Delete state ────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleData | null>(null);

  // ─── Helpers ─────────────────────────
  const saveRoles = (updated: RoleData[]) => {
    setRolesList(updated);
    persistRoles(updated);
  };

  // ─── Edit Handlers ───────────────────
  const handleEditRole = (role: RoleData) => {
    setSelectedRole(role);
    setEditName(role.name);
    setEditDescription(role.description);
    const currentPerms = permissions[role.id] || { ...EMPTY_PERMS };
    setEditPerms(JSON.parse(JSON.stringify(currentPerms)));
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedRole) return;
    saveRoles(displayRoles.map(r => r.id === selectedRole.id ? { ...r, name: editName, description: editDescription } : r));
    updateRolePermissions(selectedRole.id, editPerms);
    setShowEditModal(false);
    toast.success(`"${editName}" updated successfully!`);
  };

  const togglePermission = (module: string, action: keyof PermissionSet) => {
    setEditPerms(prev => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const toggleAll = (module: string) => {
    const perms = editPerms[module] || { read: false, create: false, edit: false, delete: false };
    const allChecked = perms.read && perms.create && perms.edit && perms.delete;
    setEditPerms(prev => ({
      ...prev,
      [module]: { read: !allChecked, create: !allChecked, edit: !allChecked, delete: !allChecked },
    }));
  };

  // ─── Create Handlers ─────────────────
  const resetCreateForm = () => {
    setNewRoleName('');
    setNewRoleDescription('');
    setNewRolePerms(JSON.parse(JSON.stringify(EMPTY_PERMS)));
    setCreateErrors({});
  };

  const toggleNewPerm = (module: string, action: keyof PermissionSet) => {
    setNewRolePerms(prev => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const toggleNewAll = (module: string) => {
    const perms = newRolePerms[module] || { read: false, create: false, edit: false, delete: false };
    const allChecked = perms.read && perms.create && perms.edit && perms.delete;
    setNewRolePerms(prev => ({
      ...prev,
      [module]: { read: !allChecked, create: !allChecked, edit: !allChecked, delete: !allChecked },
    }));
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newRoleName.trim()) errors.name = 'Role name is required';
    else if (newRoleName.trim().length < 3) errors.name = 'Minimum 3 characters';
    else if (displayRoles.some(r => r.name.toLowerCase() === newRoleName.trim().toLowerCase())) errors.name = 'Role name already exists';

    if (!newRoleDescription.trim()) errors.description = 'Description is required';

    const hasAnyPerm = Object.values(newRolePerms).some(p => p.read || p.create || p.edit || p.delete);
    if (!hasAnyPerm) errors.permissions = 'Select at least one permission';

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      toast.error('Please fix the errors');
      return;
    }

    const roleId = newRoleName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const newRole: RoleData = {
      id: roleId,
      name: newRoleName.trim(),
      description: newRoleDescription.trim(),
      users: 0,
      type: 'custom',
    };

    const updated = [...displayRoles, newRole];
    saveRoles(updated);
    updateRolePermissions(roleId, newRolePerms);

    resetCreateForm();
    setShowAddModal(false);
    toast.success(`Role "${newRole.name}" created!`);
  };

  // ─── Delete Handlers ─────────────────
  const handleDeleteRole = () => {
    if (!deleteTarget) return;
    const updated = displayRoles.filter(r => r.id !== deleteTarget.id);
    saveRoles(updated);
    // Properly remove from permissions context
    deleteRolePermissions(deleteTarget.id);
    setShowDeleteModal(false);
    setDeleteTarget(null);
    toast.success(`Role "${deleteTarget.name}" deleted`);
  };

  // ─── Render ──────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{displayRoles.length} roles</p>
        <Button onClick={() => { resetCreateForm(); setShowAddModal(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Create Role
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayRoles.map((role) => (
          <Card key={role.id} hover>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-navy-800/5 rounded-lg"><Shield className="w-5 h-5 text-navy-800" /></div>
              <Badge variant={role.type === 'system' ? 'gold' : 'info'}>{role.type}</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{role.name}</h3>
            <p className="text-sm text-gray-500 mb-3">{role.description}</p>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">{role.users} users assigned</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditRole(role)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                {role.type === 'custom' && (
                  <button
                    onClick={() => { setDeleteTarget(role); setShowDeleteModal(true); }}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ═══ EDIT MODAL ═══ */}
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
                <div className="grid grid-cols-[1fr_50px_50px_50px_50px_50px] bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <span>Module</span><span className="text-center">Read</span><span className="text-center">Create</span><span className="text-center">Edit</span><span className="text-center">Delete</span><span className="text-center">All</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {modules.map((mod) => {
                    const perms = editPerms[mod] || { read: false, create: false, edit: false, delete: false };
                    const allChecked = perms.read && perms.create && perms.edit && perms.delete;
                    return (
                      <div key={mod} className="grid grid-cols-[1fr_50px_50px_50px_50px_50px] px-4 py-2.5 hover:bg-gray-50 items-center">
                        <span className="text-sm text-gray-900">{mod}</span>
                        {(['read', 'create', 'edit', 'delete'] as (keyof PermissionSet)[]).map(action => (
                          <span key={action} className="flex justify-center">
                            <input type="checkbox" checked={perms[action]} onChange={() => togglePermission(mod, action)} className="w-4 h-4 accent-navy-800 rounded cursor-pointer" />
                          </span>
                        ))}
                        <span className="flex justify-center">
                          <input type="checkbox" checked={allChecked} onChange={() => toggleAll(mod)} className="w-4 h-4 accent-gold-500 rounded cursor-pointer" />
                        </span>
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

      {/* ═══ CREATE MODAL ═══ */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetCreateForm(); }} title="Create Custom Role" size="lg">
        <form className="space-y-4" onSubmit={handleCreateRole} noValidate>
          <Input label="Role Name *" placeholder="e.g., Regional Manager" value={newRoleName} onChange={(e) => { setNewRoleName(e.target.value); setCreateErrors(prev => { const n = {...prev}; delete n.name; return n; }); }} error={createErrors.name} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
            <textarea className={`w-full px-3 py-2 border rounded-lg text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-navy-800/20 ${createErrors.description ? 'border-red-300' : 'border-gray-300'}`} placeholder="Describe responsibilities..." value={newRoleDescription} onChange={(e) => { setNewRoleDescription(e.target.value); setCreateErrors(prev => { const n = {...prev}; delete n.description; return n; }); }} />
            {createErrors.description && <p className="text-xs text-red-500">{createErrors.description}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Module Permissions <span className="text-red-500">*</span></label>
            {createErrors.permissions && <p className="text-xs text-red-500">{createErrors.permissions}</p>}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_50px_50px_50px_50px_50px] bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <span>Module</span><span className="text-center">Read</span><span className="text-center">Create</span><span className="text-center">Edit</span><span className="text-center">Delete</span><span className="text-center">All</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {modules.map((mod) => {
                  const perms = newRolePerms[mod] || { read: false, create: false, edit: false, delete: false };
                  const allChecked = perms.read && perms.create && perms.edit && perms.delete;
                  return (
                    <div key={mod} className="grid grid-cols-[1fr_50px_50px_50px_50px_50px] px-4 py-2.5 hover:bg-gray-50 items-center">
                      <span className="text-sm text-gray-700">{mod}</span>
                      {(['read', 'create', 'edit', 'delete'] as (keyof PermissionSet)[]).map(a => (
                        <span key={a} className="flex justify-center"><input type="checkbox" checked={perms[a]} onChange={() => toggleNewPerm(mod, a)} className="w-4 h-4 accent-navy-800 rounded cursor-pointer" /></span>
                      ))}
                      <span className="flex justify-center"><input type="checkbox" checked={allChecked} onChange={() => toggleNewAll(mod)} className="w-4 h-4 accent-gold-500 rounded cursor-pointer" /></span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => { setShowAddModal(false); resetCreateForm(); }}>Cancel</Button>
            <Button type="submit">Create Role</Button>
          </div>
        </form>
      </Modal>

      {/* ═══ DELETE MODAL ═══ */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Role" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This will remove all permissions for this role. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteRole}>Delete Role</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
