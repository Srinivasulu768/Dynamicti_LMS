import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Eye, RotateCcw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { FilterBar } from '@/components/ui/FilterBar';
import certificatesData from '@/mock/certificates.json';
import type { Certificate } from '@/types';
import toast from 'react-hot-toast';

export function CertificatesPage() {
  const certs = certificatesData as Certificate[];
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => certs.filter(c => {
    const matchSearch = !search || c.userName.toLowerCase().includes(search.toLowerCase()) || c.courseName.toLowerCase().includes(search.toLowerCase()) || c.certificateNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || filters.status === 'all' || c.status === filters.status;
    return matchSearch && matchStatus;
  }), [certs, search, filters]);

  const active = certs.filter(c => c.status === 'active').length;
  const revoked = certs.filter(c => c.status === 'revoked').length;

  const columns = [
    { key: 'certificateNumber', label: 'Certificate #', render: (c: Certificate) => <span className="font-mono text-xs">{c.certificateNumber}</span> },
    { key: 'userName', label: 'Recipient', render: (c: Certificate) => <span className="font-medium">{c.userName}</span> },
    { key: 'courseName', label: 'Course' },
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
        <Button><Plus className="w-4 h-4 mr-1" /> Issue Certificate</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Issued" value={certs.length} icon={Award} />
        <StatsCard title="Active" value={active} icon={Award} />
        <StatsCard title="Revoked" value={revoked} icon={Award} />
      </div>

      <FilterBar
        searchPlaceholder="Search by name, course, certificate #..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'status', placeholder: 'All Status', options: [{ value: 'active', label: 'Active' }, { value: 'revoked', label: 'Revoked' }, { value: 'expired', label: 'Expired' }] },
        ]}
      />

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} pageSize={10} searchable={false} />
    </motion.div>
  );
}
