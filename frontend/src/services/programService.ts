import { createStorageService } from './baseService';
import type { Program } from '@/types';
import seedData from '@/mock/programs.json';

// Clear stale localStorage data that uses old schema (courses[] instead of modules[])
const SCHEMA_VERSION_KEY = 'dynamicti_programs_v';
const CURRENT_VERSION = '2';
if (localStorage.getItem(SCHEMA_VERSION_KEY) !== CURRENT_VERSION) {
  localStorage.removeItem('dynamicti_programs');
  localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_VERSION);
}

const service = createStorageService<Program>('dynamicti_programs', seedData as Program[]);

export const programService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,
};
