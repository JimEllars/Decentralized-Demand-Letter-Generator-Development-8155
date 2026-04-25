export const sessionStorageManager = {
  getItem: (key) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Error reading from sessionStorage for key "${key}":`, error);
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to sessionStorage for key "${key}":`, error);
    }
  },

  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from sessionStorage for key "${key}":`, error);
    }
  },

  clear: () => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Error clearing sessionStorage:', error);
    }
  }
};
