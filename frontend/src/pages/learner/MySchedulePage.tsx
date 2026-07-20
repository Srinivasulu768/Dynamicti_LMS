import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import sessionsData from '@/mock/sessions.json';

export function MySchedulePage() {
  const upcoming = sessionsData.filter(s => s.status === 'scheduled');
  const completed = sessionsData.filter(s => s.status === 'completed');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">Upcoming and past sessions</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h2>
        <div className="space-y-3">
          {upcoming.map((session) => (
            <Card key={session.id} className="flex items-center gap-4">
              <div className="w-14 h-14 bg-navy-800/5 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-500">{new Date(session.date).toLocaleString('en', { month: 'short' })}</span>
                <span className="text-lg font-bold text-navy-800">{new Date(session.date).getDate()}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{session.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {session.startTime} - {session.endTime}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {session.location}</span>
                </div>
              </div>
              <Badge variant="info">{session.type}</Badge>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Sessions</h2>
        <div className="space-y-3">
          {completed.map((session) => (
            <Card key={session.id} className="flex items-center gap-4 opacity-70">
              <div className="w-14 h-14 bg-green-50 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-500">{new Date(session.date).toLocaleString('en', { month: 'short' })}</span>
                <span className="text-lg font-bold text-green-700">{new Date(session.date).getDate()}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{session.title}</h3>
                <p className="text-sm text-gray-500">{session.courseName}</p>
              </div>
              <Badge variant="success">Completed</Badge>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
