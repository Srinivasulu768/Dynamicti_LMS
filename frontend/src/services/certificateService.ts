import { createStorageService } from './baseService';
import type { Certificate } from '@/types';
import seedData from '@/mock/certificates.json';

const service = createStorageService<Certificate>('dynamicti_certificates', seedData as Certificate[]);

export const certificateService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,
};
