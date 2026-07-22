import { createStorageService } from './baseService';
import type { Assessment, ParentType } from '@/types';
import seedData from '@/mock/assessments.json';

// Migrate old assessment data to include parentType if missing
function migrateSeedData(data: any[]): Assessment[] {
  return data.map((item) => ({
    ...item,
    parentType: item.parentType || 'course',
  }));
}

const service = createStorageService<Assessment>('dynamicti_assessments', migrateSeedData(seedData));

export const assessmentService = {
  getAll: service.getAll,
  getById: service.getById,
  create: service.create,
  update: service.update,
  delete: service.delete,
  saveAll: service.saveAll,

  /** Get assessments for a specific parent (course or program) */
  getByParent(parentType: ParentType, parentId: string): Assessment[] {
    return service.getAll().filter(
      (a) => a.parentType === parentType && a.courseId === parentId
    );
  },

  /** Get all course assessments */
  getCourseAssessments(): Assessment[] {
    return service.getAll().filter((a) => a.parentType === 'course');
  },

  /** Get all program assessments */
  getProgramAssessments(): Assessment[] {
    return service.getAll().filter((a) => a.parentType === 'program');
  },

  /** Get published assessments for a parent */
  getPublishedByParent(parentType: ParentType, parentId: string): Assessment[] {
    return service.getAll().filter(
      (a) => a.parentType === parentType && a.courseId === parentId && a.status === 'published'
    );
  },
};
