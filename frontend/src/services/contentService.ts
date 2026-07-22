import { createStorageService } from './baseService';
import type { ContentItem, ParentType } from '@/types';

// ─── Seed Data ─────────────────────────────────────────────────────────────
const seedContent: ContentItem[] = [
  { id: 'CNT001', title: 'Network Security Basics', contentType: 'module', parentType: 'course', parentId: 'CRS005', parentName: 'Network Security Fundamentals', order: 1, status: 'published', createdDate: '2026-06-01', updatedDate: '2026-07-18' },
  { id: 'CNT002', title: 'Threat Detection & Analysis', contentType: 'module', parentType: 'course', parentId: 'CRS001', parentName: 'Advanced Cybersecurity Operations', order: 1, status: 'published', createdDate: '2026-05-15', updatedDate: '2026-07-17' },
  { id: 'CNT003', title: 'Leadership Principles', contentType: 'module', parentType: 'course', parentId: 'CRS002', parentName: 'Leadership & Strategic Management', order: 1, status: 'published', createdDate: '2026-04-20', updatedDate: '2026-07-15' },
  { id: 'CNT004', title: 'Introduction to Firewalls', contentType: 'lesson', parentType: 'course', parentId: 'CRS005', parentName: 'Network Security Fundamentals', moduleId: 'CNT001', order: 1, duration: '45 min', status: 'published', createdDate: '2026-06-02', updatedDate: '2026-07-19' },
  { id: 'CNT005', title: 'VPN Configuration', contentType: 'lesson', parentType: 'course', parentId: 'CRS005', parentName: 'Network Security Fundamentals', moduleId: 'CNT001', order: 2, duration: '60 min', status: 'draft', createdDate: '2026-06-05', updatedDate: '2026-07-20' },
  { id: 'CNT006', title: 'Cybersecurity Best Practices Guide', contentType: 'document', parentType: 'course', parentId: 'CRS001', parentName: 'Advanced Cybersecurity Operations', order: 1, format: 'PDF', status: 'published', createdDate: '2026-05-20', updatedDate: '2026-07-16' },
  { id: 'CNT007', title: 'Incident Response Demo', contentType: 'video', parentType: 'course', parentId: 'CRS001', parentName: 'Advanced Cybersecurity Operations', order: 2, duration: '25 min', status: 'published', createdDate: '2026-05-25', updatedDate: '2026-07-14' },
  { id: 'CNT008', title: 'Drone Pre-flight Checklist', contentType: 'video', parentType: 'course', parentId: 'CRS008', parentName: 'Drone Operations & UAV Technology', order: 1, duration: '15 min', status: 'draft', createdDate: '2026-07-10', updatedDate: '2026-07-20' },
  // Program content
  { id: 'CNT009', title: 'Room Clearing Fundamentals', contentType: 'module', parentType: 'program', parentId: 'PRG001', parentName: 'DTI CQB Tier-One', order: 1, status: 'published', createdDate: '2026-04-01', updatedDate: '2026-07-10' },
  { id: 'CNT010', title: 'Entry Techniques', contentType: 'lesson', parentType: 'program', parentId: 'PRG001', parentName: 'DTI CQB Tier-One', moduleId: 'CNT009', order: 1, duration: '60 min', status: 'published', createdDate: '2026-04-02', updatedDate: '2026-07-10' },
  { id: 'CNT011', title: 'Threat Assessment in CQB', contentType: 'lesson', parentType: 'program', parentId: 'PRG001', parentName: 'DTI CQB Tier-One', moduleId: 'CNT009', order: 2, duration: '45 min', status: 'published', createdDate: '2026-04-03', updatedDate: '2026-07-10' },
  { id: 'CNT012', title: 'Advanced Marksmanship', contentType: 'module', parentType: 'program', parentId: 'PRG002', parentName: 'Sniper/Observer ISOC', order: 1, status: 'published', createdDate: '2026-05-01', updatedDate: '2026-07-12' },
];

const service = createStorageService<ContentItem>('dynamicti_content', seedContent);

export const contentService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,

  /** Get all content for a specific parent (course or program) */
  getByParent(parentType: ParentType, parentId: string): ContentItem[] {
    return service.getAll().filter(
      (item) => item.parentType === parentType && item.parentId === parentId
    );
  },

  /** Get modules for a parent */
  getModules(parentType: ParentType, parentId: string): ContentItem[] {
    return service.getAll().filter(
      (item) => item.parentType === parentType && item.parentId === parentId && item.contentType === 'module'
    ).sort((a, b) => a.order - b.order);
  },

  /** Get lessons for a specific module */
  getLessonsByModule(moduleId: string): ContentItem[] {
    return service.getAll().filter(
      (item) => item.moduleId === moduleId && item.contentType === 'lesson'
    ).sort((a, b) => a.order - b.order);
  },

  /** Get all content of a specific type for a parent */
  getByType(parentType: ParentType, parentId: string, contentType: ContentItem['contentType']): ContentItem[] {
    return service.getAll().filter(
      (item) => item.parentType === parentType && item.parentId === parentId && item.contentType === contentType
    ).sort((a, b) => a.order - b.order);
  },

  /** Count content items for a parent */
  countByParent(parentType: ParentType, parentId: string): { modules: number; lessons: number; total: number } {
    const items = service.getAll().filter(
      (item) => item.parentType === parentType && item.parentId === parentId
    );
    return {
      modules: items.filter(i => i.contentType === 'module').length,
      lessons: items.filter(i => i.contentType === 'lesson').length,
      total: items.length,
    };
  },
};
