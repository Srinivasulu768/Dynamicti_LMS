import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FilterBar } from '@/components/ui/FilterBar';
import { DataTable } from '@/components/ui/DataTable';
import usersData from '@/mock/users.json';
import type { User, Role } from '@/types';
import toast from 'react-hot-toast';

const roleColors: Record<Role, 'gold' | 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  super_admin: 'danger', training_admin: 'warning', content_manager: 'info',
  instructor: 'success', org_admin: 'gold', learner: 'default',
};

const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin', training_admin: 'Training Admin',
  content_manager: 'Content Manager', instructor: 'Instructor',
  org_admin: 'Org Admin', learner: 'Learner',
};

export function UsersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState(usersData as User[]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

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
      setUsers(users.filter(u => u.id !== selectedUser.id));
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
    {
      key: 'role', label: 'Role',
      render: (user: User) => <Badge variant={roleColors[user.role]}>{roleLabels[user.role]}</Badge>,
    },
    { key: 'organization', label: 'Organization' },
    {
      key: 'status', label: 'Status',
      render: (user: User) => (
        <Badge variant={user.status === 'active' ? 'success' : user.status === 'inactive' ? 'default' : 'danger'}>
          {user.status}
        </Badge>
      ),
    },
    { key: 'joinDate', label: 'Join Date' },
    {
      key: 'actions', label: 'Actions', sortable: false,
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-navy-800 hover:bg-navy-800/10 rounded-md transition-colors"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      ),
    },
  ];

  const orgs = [...new Set(users.map(u => u.organization).filter(Boolean))];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} total users</p>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search by name, email, organization..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          {
            key: 'role',
            placeholder: 'All Roles',
            options: Object.entries(roleLabels).map(([k, v]) => ({ value: k, label: v })),
          },
          {
            key: 'status',
            placeholder: 'All Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' },
            ],
          },
          {
            key: 'organization',
            placeholder: 'All Orgs',
            options: orgs.map(o => ({ value: o, label: o })),
          },
        ]}
      />

      {/* Table */}
      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as any}
        pageSize={8}
        searchable={false}
      />

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('User created!'); setShowAddModal(false); }}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" placeholder="First name" required />
            <Input label="Last Name" placeholder="Last name" required />
          </div>
          <Input label="Email" type="email" placeholder="email@test.com" required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Organization</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {orgs.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <Input label="Phone" placeholder="+1-555-0000" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User" size="lg">
        {selectedUser && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('User updated!'); setShowEditModal(false); }}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" defaultValue={selectedUser.firstName} required />
              <Input label="Last Name" defaultValue={selectedUser.lastName} required />
            </div>
            <Input label="Email" type="email" defaultValue={selectedUser.email} required />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedUser.role}>
                  {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" defaultValue={selectedUser.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
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

      {/* Delete Confirmation */}
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
