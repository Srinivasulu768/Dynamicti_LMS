import { createStorageService } from './baseService';
import type { Organization } from '@/types';
import seedData from '@/mock/organizations.json';

const service = createStorageService<Organization>('dynamicti_organizations', seedData as Organization[]);

export const organizationService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,
};
