import { createStorageService } from './baseService';
import type { Program } from '@/types';
import seedData from '@/mock/programs.json';

const service = createStorageService<Program>('dynamicti_programs', seedData as Program[]);

export const programService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,
};
