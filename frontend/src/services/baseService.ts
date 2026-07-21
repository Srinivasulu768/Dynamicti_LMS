/**
 * Base service utilities for localStorage-backed data persistence.
 * Provides a consistent pattern for all entity services.
 *
 * When migrating to a REST API, only this layer needs to change.
 * UI components remain untouched.
 */

/**
 * Creates a localStorage-backed service for a given entity type.
 * Seeds from provided data on first load, then always reads/writes localStorage.
 */
export function createStorageService<T extends { id: string }>(
  storageKey: string,
  seedData: T[]
) {
  function load(): T[] {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore parse errors */
    }
    // Seed from provided data on first access
    localStorage.setItem(storageKey, JSON.stringify(seedData));
    return seedData;
  }

  function save(items: T[]): void {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }

  return {
    getAll(): T[] {
      return load();
    },

    getById(id: string): T | undefined {
      return load().find((item) => item.id === id);
    },

    create(data: Omit<T, 'id'> & { id?: string }): T {
      const items = load();
      const newItem = {
        ...data,
        id: data.id || `${storageKey.toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      } as T;
      const updated = [newItem, ...items];
      save(updated);
      return newItem;
    },

    update(id: string, data: Partial<T>): T | null {
      const items = load();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;
      const updated = { ...items[index], ...data, id } as T;
      items[index] = updated;
      save(items);
      return updated;
    },

    delete(id: string): boolean {
      const items = load();
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) return false;
      save(filtered);
      return true;
    },

    /** Replace the entire dataset (use with caution) */
    saveAll(items: T[]): void {
      save(items);
    },

    /** Get current count */
    count(): number {
      return load().length;
    },
  };
}
