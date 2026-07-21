import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FilterBar } from '@/components/ui/FilterBar';
import { DataTable } from '@/components/ui/DataTable';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { usePermissions } from '@/contexts/PermissionsContext';
import { ORG_REQUIRED_ROLES, formatRoleLabel } from '@/constants/roles';
import { loadUsers, saveUsers } from '@/services/userService';
import type { User, Role } from '@/types';
import toast from 'react-hot-toast';

const roleColors: Record<string, 'gold' | 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  super_admin: 'danger', training_admin: 'warning', content_manager: 'info',
  instructor: 'success', org_admin: 'gold', learner: 'default',
};

function isOrgRequired(role: Role) { return ORG_REQUIRED_ROLES.includes(role); }

export function UsersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(loadUsers);

  // Persist users on every change
  const updateUsers = (updater: (prev: User[]) => User[]) => {
    setUsers(prev => {
      const next = updater(prev);
      saveUsers(next);
      return next;
    });
  };
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Track selected role in Add form for dynamic org field
  const [addFormRole, setAddFormRole] = useState<Role>('learner');
  // Track selected role in Edit form
  const [editFormRole, setEditFormRole] = useState<Role>('learner');

  const orgs = [...new Set(users.map(u => u.organization).filter((o): o is string => !!o))];

  // Build dynamic role options from permissions (includes custom roles)
  const { permissions: allPerms } = usePermissions();
  const allRoleOptions = Object.keys(allPerms).map(roleId => ({
    value: roleId,
    label: formatRoleLabel(roleId),
  }));

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value.trim();
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const orgSelect = form.elements.namedItem('organization') as HTMLSelectElement | null;
    const organization = orgSelect?.value?.trim() || '';

    const errors: Record<string, string> = {};
    if (!firstName) errors.firstName = 'First name is required';
    if (!lastName) errors.lastName = 'Last name is required';
    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
    else if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) errors.email = 'This email already exists';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 4) errors.password = 'Password must be at least 4 characters';

    // Validate organization — only mandatory for Org Admin
    if (isOrgRequired(addFormRole) && !organization) {
      errors.organization = 'Organization is required for this role';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill all mandatory fields');
      return;
    }

    setFormErrors({});
    // Add new user to local state
    const newUser: User = {
      id: `USR${Date.now()}`,
      firstName,
      lastName,
      email,
      password,
      role: (form.elements.namedItem('role') as HTMLSelectElement).value as Role,
      status: 'active',
      organization: organization || undefined,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim() || undefined,
      joinDate: new Date().toISOString().split('T')[0],
    } as User;
    updateUsers(prev => [newUser, ...prev]);
    toast.success('User created successfully!');
    setShowAddModal(false);
    setAddFormRole('learner');
  };

  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value.trim();
    const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const role = (form.elements.namedItem('role') as HTMLSelectElement).value as Role;
    const status = (form.elements.namedItem('status') as HTMLSelectElement).value as 'active' | 'inactive';
    const orgSelect = form.elements.namedItem('organization') as HTMLSelectElement | null;
    const organization = orgSelect?.value?.trim() || '';

    const errors: Record<string, string> = {};
    if (!firstName) errors.firstName = 'First name is required';
    if (!lastName) errors.lastName = 'Last name is required';
    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
    else if (users.some(u => u.id !== selectedUser?.id && u.email.toLowerCase() === email.toLowerCase())) errors.email = 'This email already exists';

    if (isOrgRequired(editFormRole) && !organization) {
      errors.organization = 'Organization is required for this role';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fill all mandatory fields');
      return;
    }

    // Update user in local state
    updateUsers(prev => prev.map(u => {
      if (u.id !== selectedUser?.id) return u;
      return {
        ...u,
        firstName,
        lastName,
        email,
        role,
        status,
        organization: organization || undefined,
      } as User;
    }));

    setFormErrors({});
    toast.success('User updated successfully!');
    setShowEditModal(false);
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !search || `${u.firstName} ${u.lastName} ${u.email} ${u.organization}`.toLowerCase().includes(search.toLowerCase());
      const matchRole = !filters.role || filters.role === 'all' || u.role === filters.role;
      const matchStatus = !filters.status || filters.status === 'all' || u.status === filters.status;
      const matchOrg = !filters.organization || filters.organization === 'all' || u.organization === filters.organization;
      return matchSearch && matchRole && matchStatus && matchOrg;
    });
  }, [users, search, filters]);

  const handleDelete = () => {
    if (selectedUser) {
      updateUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      toast.success('User deleted');
    }
  };

  const columns = [
    {
      key: 'firstName', label: 'Name',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{user.firstName[0]}{user.lastName[0]}</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Role', render: (user: User) => {
      const color = roleColors[user.role] || 'default';
      const label = formatRoleLabel(user.role);
      return <Badge variant={color}>{label}</Badge>;
    }},
    { key: 'organization', label: 'Organization', render: (user: User) => user.organization || '—' },
    { key: 'status', label: 'Status', render: (user: User) => <Badge variant={user.status === 'active' ? 'success' : 'default'}>{user.status}</Badge> },
    { key: 'joinDate', label: 'Join Date' },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <PermissionGate module="Users" action="edit">
            <button onClick={() => { setSelectedUser(user); setEditFormRole(user.role); setFormErrors({}); setShowEditModal(true); }} className="flex items-center gap-1 px-2 py-1 text-xs text-navy-800 hover:bg-navy-800/10 rounded-md transition-colors">
              <Edit className="w-3.5 h-3.5" /> Edit
            </button>
          </PermissionGate>
          <PermissionGate module="Users" action="delete">
            <button onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }} className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} total users</p>
        <PermissionGate module="Users" action="create">
          <Button onClick={() => { setShowAddModal(true); setAddFormRole('learner'); setFormErrors({}); }}>
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
        </PermissionGate>
      </div>

      <FilterBar
        searchPlaceholder="Search by name, email, organization..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'role', placeholder: 'All Roles', options: allRoleOptions },
          { key: 'status', placeholder: 'All Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
          { key: 'organization', placeholder: 'All Orgs', options: orgs.map(o => ({ value: o, label: o })) },
        ]}
      />

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} pageSize={10} searchable={false} />

      {/* ========== ADD USER MODAL ========== */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormErrors({}); }} title="Add New User" size="lg">
        <form className="space-y-4" onSubmit={handleAddUser} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name *" placeholder="First name" name="firstName" error={formErrors.firstName} />
            <Input label="Last Name *" placeholder="Last name" name="lastName" error={formErrors.lastName} />
          </div>
          <Input label="Email *" type="email" placeholder="email@test.com" name="email" error={formErrors.email} />
          <Input label="Password *" type="password" placeholder="Enter password" name="password" error={formErrors.password} />
          
          {/* Role selector */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
            <select
              name="role"
              value={addFormRole}
              onChange={e => setAddFormRole(e.target.value as Role)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {allRoleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Organization — optional for all roles except Org Admin (mandatory) */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Organization {isOrgRequired(addFormRole) ? <span className="text-red-500">*</span> : <span className="text-gray-400 text-xs">(optional)</span>}
            </label>
            <select
              name="organization"
              className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.organization ? 'border-red-300' : 'border-gray-300'}`}
            >
              {!isOrgRequired(addFormRole) && <option value="">— None —</option>}
              {orgs.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {formErrors.organization && <p className="text-xs text-red-500">{formErrors.organization}</p>}
          </div>

          <Input label="Phone" placeholder="+1-555-0000" name="phone" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => { setShowAddModal(false); setFormErrors({}); }}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      {/* ========== EDIT USER MODAL ========== */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setFormErrors({}); }} title="Edit User" size="lg">
        {selectedUser && (
          <form className="space-y-4" onSubmit={handleEditUser} noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name *" name="firstName" defaultValue={selectedUser.firstName} error={formErrors.firstName} />
              <Input label="Last Name *" name="lastName" defaultValue={selectedUser.lastName} error={formErrors.lastName} />
            </div>
            <Input label="Email *" type="email" name="email" defaultValue={selectedUser.email} error={formErrors.email} />
            
            <div className="grid grid-cols-2 gap-4">
              {/* Role */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                <select
                  name="role"
                  value={editFormRole}
                  onChange={e => setEditFormRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {allRoleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {/* Status */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedUser.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Organization — always shown */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Organization {isOrgRequired(editFormRole) ? <span className="text-red-500">*</span> : <span className="text-gray-400 text-xs">(optional)</span>}
              </label>
              <select
                name="organization"
                defaultValue={selectedUser.organization || ''}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.organization ? 'border-red-300' : 'border-gray-300'}`}
              >
                {!isOrgRequired(editFormRole) && <option value="">— None —</option>}
                {orgs.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {formErrors.organization && <p className="text-xs text-red-500">{formErrors.organization}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => { setShowEditModal(false); setFormErrors({}); }}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========== DELETE CONFIRMATION ========== */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete User" size="sm">
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
