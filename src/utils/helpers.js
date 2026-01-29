export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments or non-secure contexts (though unlikely for this app)
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
