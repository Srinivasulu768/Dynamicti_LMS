import { createStorageService } from './baseService';
import type { Enrollment } from '@/types';
import seedData from '@/mock/enrollments.json';

const service = createStorageService<Enrollment>('dynamicti_enrollments', seedData as Enrollment[]);

export const enrollmentService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,
};
