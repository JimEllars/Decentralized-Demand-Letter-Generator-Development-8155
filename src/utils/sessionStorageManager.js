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
      // Intentionally do NOT clear 'axim_demand_draft' or other local storage
      // when clearing session storage to preserve isolated drafts.
      // This function only clears session storage.
      sessionStorage.clear();
    } catch (error) {
      console.warn('Error clearing sessionStorage:', error);
    }
  },

  clearAuthOnly: () => {
    try {
       // Clear known auth keys but preserve others
       const keysToKeep = ['axim_demand_draft', 'axim_document_history'];
       const keysToRemove = [];
       for (let i = 0; i < sessionStorage.length; i++) {
           const key = sessionStorage.key(i);
           if (!keysToKeep.includes(key)) {
               keysToRemove.push(key);
           }
       }
       keysToRemove.forEach(k => sessionStorage.removeItem(k));
    } catch (e) {}
  }
};
