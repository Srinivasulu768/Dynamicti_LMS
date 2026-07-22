import { createStorageService } from './baseService';
import type { Certificate, ParentType } from '@/types';
import seedData from '@/mock/certificates.json';

// Migrate old certificate data to include parentType if missing
function migrateSeedData(data: any[]): Certificate[] {
  return data.map((item) => ({
    ...item,
    parentType: item.parentType || 'course',
  }));
}

const service = createStorageService<Certificate>('dynamicti_certificates', migrateSeedData(seedData));

export const certificateService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,

  /** Get certificates for a specific user */
  getByUser(userId: string): Certificate[] {
    return service.getAll().filter((c) => c.userId === userId);
  },

  /** Get certificates by parent type */
  getByParentType(parentType: ParentType): Certificate[] {
    return service.getAll().filter((c) => c.parentType === parentType);
  },

  /** Get certificates for a specific parent */
  getByParent(parentType: ParentType, parentId: string): Certificate[] {
    return service.getAll().filter(
      (c) => c.parentType === parentType && c.courseId === parentId
    );
  },

  /** Generate a certificate for a user upon course/program completion */
  generate(
    userId: string,
    userName: string,
    parentType: ParentType,
    parentId: string,
    parentName: string,
    templateId: string,
    validityMonths: number
  ): Certificate {
    const issueDate = new Date().toISOString().split('T')[0];
    let expiryDate: string | undefined;
    if (validityMonths > 0) {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + validityMonths);
      expiryDate = expiry.toISOString().split('T')[0];
    }
    const certNumber = `DTI-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    return service.create({
      userId,
      userName,
      courseId: parentId,
      courseName: parentName,
      parentType,
      issueDate,
      expiryDate,
      certificateNumber: certNumber,
      status: 'active',
      templateId,
    } as Omit<Certificate, 'id'>);
  },

  /** Check if user already has a certificate for a parent */
  hasActiveCertificate(userId: string, parentId: string): boolean {
    return service.getAll().some(
      (c) => c.userId === userId && c.courseId === parentId && c.status === 'active'
    );
  },
};
