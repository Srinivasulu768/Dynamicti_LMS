import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FilterBar } from '@/components/ui/FilterBar';
import organizationsData from '@/mock/organizations.json';
import type { Organization } from '@/types';
import toast from 'react-hot-toast';

export function OrganizationsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const orgs = organizationsData as Organization[];
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => orgs.filter(o => {
    const matchSearch = !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.industry.toLowerCase().includes(search.toLowerCase());
    const matchType = !filters.type || filters.type === 'all' || o.type === filters.type;
    const matchStatus = !filters.status || filters.status === 'all' || o.status === filters.status;
    return matchSearch && matchType && matchStatus;
  }), [orgs, search, filters]);

  const columns = [
    {
      key: 'name',
      label: 'Organization',
      render: (org: Organization) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-navy-800/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-navy-800" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{org.name}</p>
            <p className="text-xs text-gray-500">{org.industry}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', label: 'Type' },
    {
      key: 'totalUsers',
      label: 'Users',
      render: (org: Organization) => (
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" /> {org.totalUsers}</span>
      ),
    },
    { key: 'activeEnrollments', label: 'Enrollments' },
    {
      key: 'complianceRate',
      label: 'Compliance',
      render: (org: Organization) => (
        <div className="flex items-center gap-2 min-w-[100px]">
          <ProgressBar value={org.complianceRate} size="sm" color={org.complianceRate >= 80 ? 'green' : 'gold'} className="flex-1" />
          <span className="text-xs font-medium">{org.complianceRate}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (org: Organization) => <Badge variant={org.status === 'active' ? 'success' : 'default'}>{org.status}</Badge>,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} registered organizations</p>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add Organization
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-navy-800/5 rounded-lg"><Building2 className="w-5 h-5 text-navy-800" /></div>
          <div><p className="text-sm text-gray-500">Total</p><p className="text-xl font-bold">{orgs.length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Total Users</p><p className="text-xl font-bold">{orgs.reduce((sum, o) => sum + o.totalUsers, 0)}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-gold-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-gold-500" /></div>
          <div><p className="text-sm text-gray-500">Avg Compliance</p><p className="text-xl font-bold">{Math.round(orgs.reduce((sum, o) => sum + o.complianceRate, 0) / orgs.length)}%</p></div>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Search organizations..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'type', placeholder: 'All Types', options: [{ value: 'Enterprise', label: 'Enterprise' }, { value: 'Government', label: 'Government' }, { value: 'Training Provider', label: 'Training Provider' }] },
          { key: 'status', placeholder: 'All Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        ]}
      />

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} pageSize={10} searchable={false} />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Organization" size="lg">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Organization added!'); setShowAddModal(false); }}>
          <Input label="Organization Name" placeholder="Enter name" required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Enterprise</option><option>Government</option><option>Training Provider</option>
              </select>
            </div>
            <Input label="Industry" placeholder="e.g., Defense" />
          </div>
          <Input label="Contact Person" placeholder="Full name" />
          <Input label="Email" type="email" placeholder="contact@org.com" />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Add Organization</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
