import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import notificationsData from '@/mock/notifications.json';
import toast from 'react-hot-toast';

type NotifType = 'info' | 'warning' | 'success' | 'error';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotifType;
  read: boolean;
  date: string;
  route?: string;
}

const typeIcons  = { info: Info, warning: AlertTriangle, success: CheckCircle, error: XCircle };
const typeColors = { info: 'text-blue-500', warning: 'text-yellow-500', success: 'text-green-500', error: 'text-red-500' };
const typeBg     = { info: 'bg-blue-50', warning: 'bg-yellow-50', success: 'bg-green-50', error: 'bg-red-50' };
const typeBorder = { info: 'border-blue-200', warning: 'border-yellow-200', success: 'border-green-200', error: 'border-red-200' };

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationsData as NotificationItem[]);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleClick = (notif: NotificationItem) => {
    markRead(notif.id);
    if (notif.route) navigate(notif.route);
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{unread} unread · {notifications.length} total</p>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCheck className="w-4 h-4 mr-1" /> Mark All Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium">All caught up!</p>
            <p className="text-sm">No notifications to show.</p>
          </div>
        )}

        {notifications.map((notif) => {
          const Icon = typeIcons[notif.type] || Info;
          return (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-all hover:shadow-md ${!notif.read ? 'border-l-4 border-l-navy-800' : ''}`}
            >
              <div
                className="flex items-start gap-4"
                onClick={() => handleClick(notif)}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${typeBg[notif.type]} border ${typeBorder[notif.type]}`}>
                  <Icon className={`w-5 h-5 ${typeColors[notif.type]}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!notif.read && <span className="w-2 h-2 bg-navy-800 rounded-full flex-shrink-0" />}
                      <h3 className={`font-semibold text-gray-900 text-sm ${!notif.read ? '' : 'ml-4'}`}>
                        {notif.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      {!notif.read && (
                        <button
                          onClick={() => markRead(notif.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5 text-gray-400 hover:text-green-500" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotif(notif.id)}
                        className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>

                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-gray-400">{new Date(notif.date).toLocaleString()}</p>
                    {notif.route && (
                      <span className="flex items-center gap-1 text-xs text-navy-800 font-medium hover:underline">
                        View <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
