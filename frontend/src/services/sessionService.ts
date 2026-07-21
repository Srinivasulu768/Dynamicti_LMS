import { createStorageService } from './baseService';
import type { Session } from '@/types';
import seedData from '@/mock/sessions.json';

const service = createStorageService<Session>('dynamicti_sessions', seedData as Session[]);

export const sessionService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,
};
