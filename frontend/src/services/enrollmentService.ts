import { createStorageService } from './baseService';
import type { Enrollment, ParentType } from '@/types';
import seedData from '@/mock/enrollments.json';

// Migrate old enrollment data to include parentType if missing
function migrateSeedData(data: any[]): Enrollment[] {
  return data.map((item) => ({
    ...item,
    parentType: item.parentType || 'course',
  }));
}

const service = createStorageService<Enrollment>('dynamicti_enrollments', migrateSeedData(seedData));

export const enrollmentService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,

  /** Get enrollments for a specific user */
  getByUser(userId: string): Enrollment[] {
    return service.getAll().filter((e) => e.userId === userId);
  },

  /** Get enrollments for a specific user by parent type */
  getByUserAndType(userId: string, parentType: ParentType): Enrollment[] {
    return service.getAll().filter(
      (e) => e.userId === userId && e.parentType === parentType
    );
  },

  /** Get enrollments for a specific course/program */
  getByParent(parentType: ParentType, parentId: string): Enrollment[] {
    return service.getAll().filter(
      (e) => e.parentType === parentType && e.courseId === parentId
    );
  },

  /** Check if a user is already enrolled in a course/program */
  isEnrolled(userId: string, parentId: string): boolean {
    return service.getAll().some(
      (e) => e.userId === userId && e.courseId === parentId && e.status !== 'dropped'
    );
  },

  /** Enroll a user in a course or program */
  enroll(userId: string, userName: string, parentType: ParentType, parentId: string, parentName: string): Enrollment | null {
    if (enrollmentService.isEnrolled(userId, parentId)) return null;
    return service.create({
      userId,
      userName,
      courseId: parentId,
      courseName: parentName,
      parentType,
      progress: 0,
      status: 'enrolled',
      enrolledDate: new Date().toISOString().split('T')[0],
    } as Omit<Enrollment, 'id'>);
  },

  /** Update progress */
  updateProgress(enrollmentId: string, progress: number): Enrollment | null {
    const updates: Partial<Enrollment> = { progress };
    if (progress > 0 && progress < 100) updates.status = 'in_progress';
    if (progress >= 100) {
      updates.status = 'completed';
      updates.completedDate = new Date().toISOString().split('T')[0];
    }
    return service.update(enrollmentId, updates);
  },

  /** Get user's course enrollments */
  getUserCourses(userId: string): Enrollment[] {
    return service.getAll().filter(
      (e) => e.userId === userId && e.parentType === 'course'
    );
  },

  /** Get user's program enrollments */
  getUserPrograms(userId: string): Enrollment[] {
    return service.getAll().filter(
      (e) => e.userId === userId && e.parentType === 'program'
    );
  },
};
