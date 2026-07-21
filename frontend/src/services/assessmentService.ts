import { createStorageService } from './baseService';
import type { Assessment } from '@/types';
import seedData from '@/mock/assessments.json';

const service = createStorageService<Assessment>('dynamicti_assessments', seedData as Assessment[]);

export const assessmentService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,
};
