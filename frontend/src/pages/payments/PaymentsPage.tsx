import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { FilterBar } from '@/components/ui/FilterBar';
import paymentsData from '@/mock/payments.json';
import type { Payment } from '@/types';

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  completed: 'success', pending: 'warning', failed: 'danger', refunded: 'info',
};

export function PaymentsPage() {
  const payments = paymentsData as Payment[];
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => payments.filter(p => {
    const matchSearch = !search || p.userName.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filters.status || filters.status === 'all' || p.status === filters.status;
    const matchMethod = !filters.method || filters.method === 'all' || p.method === filters.method;
    return matchSearch && matchStatus && matchMethod;
  }), [payments, search, filters]);

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const columns = [
    { key: 'id', label: 'Payment ID' },
    { key: 'userName', label: 'User', render: (p: Payment) => <span className="font-medium">{p.userName}</span> },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', render: (p: Payment) => <span className="font-semibold">${p.amount.toLocaleString()}</span> },
    { key: 'method', label: 'Method', render: (p: Payment) => <span className="capitalize">{p.method.replace('_', ' ')}</span> },
    { key: 'status', label: 'Status', render: (p: Payment) => <Badge variant={statusColors[p.status]}>{p.status}</Badge> },
    { key: 'date', label: 'Date' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} trend={{ value: 12, isPositive: true }} />
        <StatsCard title="Pending" value={`$${pendingAmount.toLocaleString()}`} icon={TrendingUp} />
        <StatsCard title="Transactions" value={payments.length} icon={CreditCard} />
        <StatsCard title="Failed" value={payments.filter(p => p.status === 'failed').length} icon={AlertCircle} />
      </div>

      <FilterBar
        searchPlaceholder="Search by user or description..."
        onSearchChange={setSearch}
        onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
        filters={[
          { key: 'status', placeholder: 'All Status', options: [{ value: 'completed', label: 'Completed' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }] },
          { key: 'method', placeholder: 'All Methods', options: [{ value: 'credit_card', label: 'Credit Card' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'paypal', label: 'PayPal' }, { value: 'invoice', label: 'Invoice' }] },
        ]}
      />

      <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as any} pageSize={10} searchable={false} />
    </motion.div>
  );
}
