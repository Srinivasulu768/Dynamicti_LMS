import { createStorageService } from './baseService';
import type { Payment } from '@/types';
import seedData from '@/mock/payments.json';

const service = createStorageService<Payment>('dynamicti_payments', seedData as Payment[]);

export const paymentService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,
};
