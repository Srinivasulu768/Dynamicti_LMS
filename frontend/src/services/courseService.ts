import coursesData from '@/mock/courses.json';
import type { Course } from '@/types';

const STORAGE_KEY = 'dynamicti_courses';

/**
 * Single source of truth for all course data.
 * Initializes from mock data on first load, then persists to localStorage.
 * All pages must use this service — never import mock/courses.json directly.
 */

function loadCourses(): Course[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Course[];
    }
  } catch {
    /* ignore parse errors */
  }
  // First-time initialization from mock data
  const initial = coursesData as Course[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveCourses(courses: Course[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

// ─── Public API ────────────────────────────────────────────────────────────

export function getCourses(): Course[] {
  return loadCourses();
}

export function getCourseById(id: string): Course | undefined {
  return loadCourses().find((c) => c.id === id);
}

export function createCourse(data: Omit<Course, 'id'>): Course {
  const courses = loadCourses();
  const newCourse: Course = {
    ...data,
    id: `CRS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  const updated = [newCourse, ...courses];
  saveCourses(updated);
  return newCourse;
}

export function updateCourse(id: string, data: Partial<Course>): Course | null {
  const courses = loadCourses();
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated = { ...courses[index], ...data, id }; // id is immutable
  courses[index] = updated;
  saveCourses(courses);
  return updated;
}

export function deleteCourse(id: string): boolean {
  const courses = loadCourses();
  const filtered = courses.filter((c) => c.id !== id);
  if (filtered.length === courses.length) return false;
  saveCourses(filtered);
  return true;
}
