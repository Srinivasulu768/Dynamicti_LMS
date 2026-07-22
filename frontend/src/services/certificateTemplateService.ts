import { createStorageService } from './baseService';
import type { CertificateTemplate, ParentType } from '@/types';

// ─── Seed Data ─────────────────────────────────────────────────────────────
const seedTemplates: CertificateTemplate[] = [
  { id: 'TPL001', title: 'Compliance Training Certificate', parentType: 'course', parentId: 'CRS009', parentName: 'Compliance & Regulatory Training', validityMonths: 12, status: 'active', createdDate: '2026-01-15' },
  { id: 'TPL002', title: 'Network Security Certification', parentType: 'course', parentId: 'CRS005', parentName: 'Network Security Fundamentals', validityMonths: 24, status: 'active', createdDate: '2026-02-01' },
  { id: 'TPL003', title: 'Leadership Excellence Certificate', parentType: 'course', parentId: 'CRS002', parentName: 'Leadership & Strategic Management', validityMonths: 24, status: 'active', createdDate: '2026-03-01' },
  { id: 'TPL004', title: 'CQB Tier-One Completion', parentType: 'program', parentId: 'PRG001', parentName: 'DTI CQB Tier-One', validityMonths: 36, status: 'active', createdDate: '2026-04-01' },
  { id: 'TPL005', title: 'Sniper/Observer ISOC Certificate', parentType: 'program', parentId: 'PRG002', parentName: 'Sniper/Observer ISOC', validityMonths: 36, status: 'active', createdDate: '2026-04-15' },
  { id: 'TPL006', title: 'Active Shooter Response Certificate', parentType: 'program', parentId: 'PRG008', parentName: 'Active Shooter Response', validityMonths: 12, status: 'active', createdDate: '2026-05-01' },
];

const service = createStorageService<CertificateTemplate>('dynamicti_cert_templates', seedTemplates);

export const certificateTemplateService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,

  /** Get template for a specific parent */
  getByParent(parentType: ParentType, parentId: string): CertificateTemplate | undefined {
    return service.getAll().find(
      (t) => t.parentType === parentType && t.parentId === parentId
    );
  },

  /** Get all templates by parent type */
  getAllByType(parentType: ParentType): CertificateTemplate[] {
    return service.getAll().filter((t) => t.parentType === parentType);
  },
};
