import { createStorageService } from './baseService';
import type { Notification } from '@/types';
import seedData from '@/mock/notifications.json';

const service = createStorageService<Notification>('dynamicti_notifications', seedData as Notification[]);

export const notificationService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,

  /** Mark a single notification as read */
  markAsRead(id: string): Notification | null {
    return service.update(id, { read: true } as Partial<Notification>);
  },

  /** Mark all notifications as read */
  markAllAsRead(): void {
    const all = service.getAll();
    const updated = all.map((n) => ({ ...n, read: true }));
    service.saveAll(updated);
  },

  /** Get count of unread notifications */
  getUnreadCount(): number {
    return service.getAll().filter((n) => !n.read).length;
  },
};
