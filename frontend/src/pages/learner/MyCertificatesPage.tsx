import { motion } from 'framer-motion';
import { Award, Download, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { certificateService } from '@/services/certificateService';
import toast from 'react-hot-toast';

export function MyCertificatesPage() {
  const myCerts = certificateService.getAll().filter(c => c.userId === 'USR006');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-sm text-gray-500 mt-1">{myCerts.length} certificates earned</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myCerts.map((cert) => (
          <Card key={cert.id} hover className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-bl-full" />
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gold-500/10 rounded-lg">
                <Award className="w-8 h-8 text-gold-500" />
              </div>
              <div className="flex-1">
                <Badge variant="success" className="mb-2">{cert.status}</Badge>
                <h3 className="font-semibold text-gray-900">{cert.courseName}</h3>
                <p className="text-sm text-gray-500 mt-1">Certificate #: {cert.certificateNumber}</p>
                <p className="text-sm text-gray-500">Issued: {cert.issueDate}</p>
                {cert.expiryDate && <p className="text-sm text-gray-500">Expires: {cert.expiryDate}</p>}
                <div className="flex gap-2 mt-4">
                  <Button variant="primary" size="sm" onClick={() => toast.success('Downloading...')}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success('Verification link copied')}>
                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Verify
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
