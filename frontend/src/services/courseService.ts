import { createStorageService } from './baseService';
import type { Course } from '@/types';
import coursesData from '@/mock/courses.json';

const service = createStorageService<Course>('dynamicti_courses', coursesData as Course[]);

// ─── Public API (backward-compatible exports) ──────────────────────────────

export function getCourses(): Course[] {
  return service.getAll();
}

export function getCourseById(id: string): Course | undefined {
  return service.getById(id);
}

export function createCourse(data: Omit<Course, 'id'>): Course {
  return service.create(data);
}

export function updateCourse(id: string, data: Partial<Course>): Course | null {
  return service.update(id, data);
}

export function deleteCourse(id: string): boolean {
  return service.delete(id);
}

// ─── New Workflow Methods ───────────────────────────────────────────────────

/** Get courses by status */
export function getCoursesByStatus(status: Course['status']): Course[] {
  return service.getAll().filter((c) => c.status === status);
}

/** Get published courses only (catalog) */
export function getPublishedCourses(): Course[] {
  return service.getAll().filter((c) => c.status === 'published');
}

/** Publish a course (draft → published) */
export function publishCourse(id: string): Course | null {
  return service.update(id, { status: 'published', publishedDate: new Date().toISOString().split('T')[0] });
}

/** Archive a course (published → archived) */
export function archiveCourse(id: string): Course | null {
  return service.update(id, { status: 'archived' });
}

/** Restore a course to draft */
export function restoreCourse(id: string): Course | null {
  return service.update(id, { status: 'draft' });
}

/** Assign a content manager to a course */
export function assignCourseContentManager(id: string, userId: string): Course | null {
  return service.update(id, { assignedTo: userId });
}

/** Export the service object for consistency */
export const courseService = {
  getAll: getCourses,
  getById: getCourseById,
  create: createCourse,
  update: updateCourse,
  delete: deleteCourse,
  getByStatus: getCoursesByStatus,
  getPublished: getPublishedCourses,
  publish: publishCourse,
  archive: archiveCourse,
  restore: restoreCourse,
  assignContentManager: assignCourseContentManager,
};
