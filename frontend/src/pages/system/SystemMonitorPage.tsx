import { motion } from 'framer-motion';
import { Activity, Server, Database, Cpu, HardDrive, Wifi, CheckCircle, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';

const systemMetrics = [
  { time: '00:00', cpu: 45, memory: 62, network: 30 },
  { time: '04:00', cpu: 32, memory: 58, network: 15 },
  { time: '08:00', cpu: 65, memory: 70, network: 55 },
  { time: '12:00', cpu: 78, memory: 75, network: 70 },
  { time: '16:00', cpu: 72, memory: 72, network: 65 },
  { time: '20:00', cpu: 55, memory: 68, network: 40 },
];

const services = [
  { name: 'Web Server', status: 'healthy', uptime: '99.9%', response: '45ms' },
  { name: 'Database', status: 'healthy', uptime: '99.8%', response: '12ms' },
  { name: 'File Storage', status: 'healthy', uptime: '99.9%', response: '78ms' },
  { name: 'Email Service', status: 'warning', uptime: '98.5%', response: '250ms' },
  { name: 'Video Streaming', status: 'healthy', uptime: '99.7%', response: '95ms' },
  { name: 'Search Engine', status: 'healthy', uptime: '99.9%', response: '22ms' },
];

const activityLogs = [
  { id: 1, action: 'User login', user: 'Marcus Anderson', time: '2 min ago', type: 'auth' },
  { id: 2, action: 'Course published', user: 'David Chen', time: '15 min ago', type: 'content' },
  { id: 3, action: 'Payment processed', user: 'System', time: '30 min ago', type: 'payment' },
  { id: 4, action: 'Backup completed', user: 'System', time: '1 hour ago', type: 'system' },
  { id: 5, action: 'Certificate issued', user: 'System', time: '2 hours ago', type: 'certificate' },
];

export function SystemMonitorPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Monitor</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time system health and performance</p>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Cpu className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">CPU Usage</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">72%</p>
          <ProgressBar value={72} color="blue" />
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <HardDrive className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Memory</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">68%</p>
          <ProgressBar value={68} color="green" />
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-gold-500" />
            <span className="text-sm font-medium text-gray-700">Storage</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">45%</p>
          <ProgressBar value={45} color="gold" />
        </Card>
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Wifi className="w-5 h-5 text-navy-800" />
            <span className="text-sm font-medium text-gray-700">Network</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">55%</p>
          <ProgressBar value={55} color="navy" />
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader><CardTitle>System Performance (24h)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={systemMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#2563eb" strokeWidth={2} name="CPU" />
              <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} name="Memory" />
              <Line type="monotone" dataKey="network" stroke="#d4a843" strokeWidth={2} name="Network" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services */}
        <Card>
          <CardHeader><CardTitle>Service Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {service.status === 'healthy' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                      <p className="text-xs text-gray-500">Uptime: {service.uptime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={service.status === 'healthy' ? 'success' : 'warning'}>{service.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{service.response}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-gold-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.user} · {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
