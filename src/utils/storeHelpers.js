import { generateId } from './helpers.js';

/**
 * Loads and migrates form data from a JSON string.
 * @param {string|null} saved - The JSON string from storage.
 * @param {Object|Function} initialDataOrFn - Fallback data or function.
 * @returns {Object} The parsed and migrated data, or initial data.
 */
export const loadAndMigrateData = (saved, initialDataOrFn) => {
  if (!saved) {
    return typeof initialDataOrFn === 'function' ? initialDataOrFn() : initialDataOrFn;
  }

  try {
    const parsed = JSON.parse(saved);
    // Migration: Ensure all items have IDs
    if (parsed.items && Array.isArray(parsed.items)) {
      parsed.items = parsed.items.map(item => ({
        ...item,
        id: item.id || generateId()
      }));
    }
    return parsed;
  } catch (error) {
    // Silently ignore parsing errors and return initial data
    return typeof initialDataOrFn === 'function' ? initialDataOrFn() : initialDataOrFn;
  }
};
