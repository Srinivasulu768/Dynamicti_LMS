import { createStorageService } from './baseService';
import type { MediaItem, ParentType } from '@/types';

// ─── Seed Data ─────────────────────────────────────────────────────────────
const seedMedia: MediaItem[] = [
  { id: 'MDA001', title: 'Incident Response Procedures', mediaType: 'video', url: '/media/incident-response.mp4', size: '245 MB', duration: '25:30', category: 'Cybersecurity', parentType: 'course', parentId: 'CRS001', parentName: 'Advanced Cybersecurity Operations', status: 'published', uploadDate: '2026-06-15', views: 1245 },
  { id: 'MDA002', title: 'Drone Pre-flight Checklist', mediaType: 'video', url: '/media/drone-preflight.mp4', size: '180 MB', duration: '15:45', category: 'Technology', parentType: 'course', parentId: 'CRS008', parentName: 'Drone Operations & UAV Technology', status: 'published', uploadDate: '2026-06-20', views: 892 },
  { id: 'MDA003', title: 'Leadership in Crisis', mediaType: 'video', url: '/media/leadership-crisis.mp4', size: '420 MB', duration: '42:10', category: 'Leadership', parentType: 'course', parentId: 'CRS002', parentName: 'Leadership & Strategic Management', status: 'published', uploadDate: '2026-05-28', views: 2100 },
  { id: 'MDA004', title: 'Network Monitoring Tools', mediaType: 'video', url: '/media/network-monitoring.mp4', size: '380 MB', duration: '38:20', category: 'Cybersecurity', parentType: 'course', parentId: 'CRS005', parentName: 'Network Security Fundamentals', status: 'published', uploadDate: '2026-06-01', views: 1567 },
  { id: 'MDA005', title: 'First Aid in the Field', mediaType: 'video', url: '/media/first-aid.mp4', size: '550 MB', duration: '55:00', category: 'Medical', status: 'published', uploadDate: '2026-06-10', views: 987 },
  { id: 'MDA006', title: 'Data Visualization Basics', mediaType: 'video', url: '/media/data-viz.mp4', size: '200 MB', duration: '20:15', category: 'Analytics', status: 'draft', uploadDate: '2026-07-18', views: 654 },
  { id: 'MDA007', title: 'CQB Tactics Handbook', mediaType: 'pdf', url: '/media/cqb-handbook.pdf', size: '4.2 MB', category: 'Combatives', parentType: 'program', parentId: 'PRG001', parentName: 'DTI CQB Tier-One', status: 'published', uploadDate: '2026-04-01', views: 320 },
  { id: 'MDA008', title: 'Sniper Field Manual', mediaType: 'document', url: '/media/sniper-manual.pdf', size: '6.8 MB', category: 'Field/Range', parentType: 'program', parentId: 'PRG002', parentName: 'Sniper/Observer ISOC', status: 'published', uploadDate: '2026-05-01', views: 210 },
  { id: 'MDA009', title: 'Compliance Handbook', mediaType: 'pdf', url: '/media/compliance.pdf', size: '2.1 MB', category: 'Compliance', parentType: 'course', parentId: 'CRS009', parentName: 'Compliance & Regulatory Training', status: 'published', uploadDate: '2026-05-15', views: 450 },
  { id: 'MDA010', title: 'Security Planning Templates', mediaType: 'document', url: '/media/security-templates.pdf', size: '2.5 MB', category: 'Executive Protection', parentType: 'program', parentId: 'PRG013', parentName: 'Church/School/Large Venue Protection', status: 'published', uploadDate: '2026-06-01', views: 189 },
];

const service = createStorageService<MediaItem>('dynamicti_media', seedMedia);

export const mediaService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,

  /** Get all media for a specific parent (course or program) */
  getByParent(parentType: ParentType, parentId: string): MediaItem[] {
    return service.getAll().filter(
      (item) => item.parentType === parentType && item.parentId === parentId
    );
  },

  /** Get unattached media (available to attach) */
  getUnattached(): MediaItem[] {
    return service.getAll().filter((item) => !item.parentId);
  },

  /** Get media by type */
  getByType(mediaType: MediaItem['mediaType']): MediaItem[] {
    return service.getAll().filter((item) => item.mediaType === mediaType);
  },

  /** Attach media to a parent */
  attachToParent(mediaId: string, parentType: ParentType, parentId: string, parentName: string): MediaItem | null {
    return service.update(mediaId, { parentType, parentId, parentName });
  },

  /** Detach media from parent */
  detachFromParent(mediaId: string): MediaItem | null {
    const item = service.getById(mediaId);
    if (!item) return null;
    return service.update(mediaId, { parentType: undefined, parentId: undefined, parentName: undefined } as any);
  },
};
