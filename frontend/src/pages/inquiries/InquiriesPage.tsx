import { motion } from 'framer-motion';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';

const inquiries = [
  { id: 'INQ001', company: 'Apex Defense Corp', type: 'Enterprise Training', contact: 'John Miller', email: 'john@apexdefense.com', status: 'new', date: '2026-07-19', budget: '$50,000+' },
  { id: 'INQ002', company: 'SecureTech Solutions', type: 'Cybersecurity Program', contact: 'Sarah Park', email: 'sarah@securetech.com', status: 'in_progress', date: '2026-07-18', budget: '$25,000-50,000' },
  { id: 'INQ003', company: 'GlobalForce Inc', type: 'Consultation', contact: 'Mike Torres', email: 'mike@globalforce.com', status: 'pending', date: '2026-07-17', budget: '$10,000-25,000' },
  { id: 'INQ004', company: 'Pacific Naval Base', type: 'Training Program', contact: 'Adm. Collins', email: 'collins@pacific.mil', status: 'proposal_sent', date: '2026-07-15', budget: '$100,000+' },
  { id: 'INQ005', company: 'Meridian Healthcare', type: 'Compliance Training', contact: 'Dr. Alan Park', email: 'alan@meridian.com', status: 'closed', date: '2026-07-10', budget: '$15,000-25,000' },
];

const statusColors: Record<string, 'info' | 'warning' | 'success' | 'default' | 'gold'> = {
  new: 'info', in_progress: 'warning', pending: 'default', proposal_sent: 'gold', closed: 'success',
};

export function InquiriesPage() {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'company', label: 'Company', render: (r: any) => <span className="font-medium">{r.company}</span> },
    { key: 'type', label: 'Type' },
    { key: 'contact', label: 'Contact' },
    { key: 'budget', label: 'Budget' },
    { key: 'status', label: 'Status', render: (r: any) => <Badge variant={statusColors[r.status]}>{r.status.replace('_', ' ')}</Badge> },
    { key: 'date', label: 'Date' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage training inquiries and proposals</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-1" /> New Inquiry</Button>
      </div>

      <DataTable data={inquiries as any} columns={columns} pageSize={10} />
    </motion.div>
  );
}
