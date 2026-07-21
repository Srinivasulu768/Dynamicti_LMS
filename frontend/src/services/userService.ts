import type { User } from '@/types';
import seedUsers from '@/mock/users.json';

const STORAGE_KEY = 'dynamicti_users';

/** Load users from localStorage, seeding from JSON if needed */
export function loadUsers(): User[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // Seed from JSON
  const seed = seedUsers as User[];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

/** Persist the full users array */
export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/** Count users by role */
export function countUsersByRole(users: User[]): Record<string, number> {
  const counts: Record<string, number> = {};
  users.forEach(u => {
    counts[u.role] = (counts[u.role] || 0) + 1;
  });
  return counts;
}
